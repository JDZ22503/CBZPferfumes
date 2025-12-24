<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Order;
use App\Models\Party;
use App\Models\Product;
use App\Models\ProductSet;
use App\Models\Attar;
use App\Models\OrderItem;
use App\Models\Transaction;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');

        $query = Order::with(['party', 'items.product', 'items.productSet', 'items.attar'])->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhereHas('party', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $orders = $query->paginate(10);

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'filters' => [
                'search' => $search,
            ]
        ]);
    }

    public function create()
    {
        return Inertia::render('Orders/Create', [
            'parties' => Party::all(),
            'products' => Product::with('stock')->get(),
            'productSets' => ProductSet::with('stock')->get(),
            'attars' => Attar::with('stock')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'party_id' => 'required|exists:parties,id',
            'order_date' => 'required|date',
            'type' => 'required|in:sale,purchase',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|required_without_all:items.*.product_set_id,items.*.attar_id|exists:products,id',
            'items.*.product_set_id' => 'nullable|required_without_all:items.*.product_id,items.*.attar_id|exists:product_sets,id',
            'items.*.attar_id' => 'nullable|required_without_all:items.*.product_id,items.*.product_set_id|exists:attars,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $totalAmount = 0;
            foreach ($validated['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            $order = Order::create([
                'party_id' => $validated['party_id'],
                'order_date' => $validated['order_date'],
                'status' => 'pending', 
                'payment_status' => 'unpaid',
                'total_amount' => $totalAmount,
                'type' => $validated['type'],
            ]);

            foreach ($validated['items'] as $item) {
                $productId = $item['product_id'] ?? null;
                $productSetId = $item['product_set_id'] ?? null;
                $attarId = $item['attar_id'] ?? null;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $productId,
                    'product_set_id' => $productSetId,
                    'attar_id' => $attarId,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                ]);

                // Update Stock
                if ($productId) {
                    $product = Product::find($productId);
                } elseif ($productSetId) {
                    $product = ProductSet::find($productSetId);
                } else {
                    $product = Attar::find($attarId);
                }

                if ($validated['type'] === 'sale') {
                    if ($product->stock) {
                        $product->stock()->decrement('quantity', $item['quantity']);
                    }
                } else {
                    if ($product->stock) {
                        $product->stock()->increment('quantity', $item['quantity']);
                    } else {
                        $product->stock()->create(['quantity' => $item['quantity']]);
                    }
                }
            }

            // Update Party Balance & Create Transaction
            $party = Party::find($validated['party_id']);
            if ($validated['type'] === 'sale') {
                $party->increment('balance', $totalAmount);
                
                Transaction::create([
                    'party_id' => $party->id,
                    'order_id' => $order->id,
                    'type' => 'debit', // Debit the party (they owe us)
                    'amount' => $totalAmount,
                    'description' => 'Sale Order #' . $order->id,
                    'transaction_date' => $validated['order_date'],
                ]);
            } else {
                $party->decrement('balance', $totalAmount);

                Transaction::create([
                    'party_id' => $party->id,
                    'order_id' => $order->id,
                    'type' => 'credit', // Credit the party (we owe them)
                    'amount' => $totalAmount,
                    'description' => 'Purchase Order #' . $order->id,
                    'transaction_date' => $validated['order_date'],
                ]);
            }
        });

        return redirect()->route('orders.index');
    }

    public function show(Order $order)
    {
        $order->load(['party', 'items.product', 'items.productSet', 'items.attar']);
        return Inertia::render('Orders/Show', [
            'order' => $order
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,completed,cancelled',
            'payment_status' => 'required|in:paid,unpaid,partial',
            'message' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated, $order) {
            // Handle Payment Status Change
            // 1. If changing to 'paid' (from unpaid/partial)
            if ($order->payment_status !== 'paid' && $validated['payment_status'] === 'paid') {
                $party = $order->party;
                if ($order->type === 'sale') {
                    // Customer pays us. Reduce their debt (Balance goes down).
                    $party->decrement('balance', $order->total_amount);

                    Transaction::create([
                        'party_id' => $party->id,
                        'order_id' => $order->id,
                        'type' => 'credit', // Credit the party account (payment received)
                        'amount' => $order->total_amount,
                        'description' => 'Payment Received for Order #' . $order->id,
                        'transaction_date' => now(),
                    ]);
                } else {
                    // We pay supplier. Reduce our debt (Balance goes up, from negative towards zero).
                    $party->increment('balance', $order->total_amount);

                    Transaction::create([
                        'party_id' => $party->id,
                        'order_id' => $order->id,
                        'type' => 'debit', // Debit the supplier account (payment made)
                        'amount' => $order->total_amount,
                        'description' => 'Payment Made for Order #' . $order->id,
                        'transaction_date' => now(),
                    ]);
                }
            }
            // 2. If changing FROM 'paid' TO 'unpaid'/'partial' (Reverting payment)
            elseif ($order->payment_status === 'paid' && $validated['payment_status'] !== 'paid') {
                $party = $order->party;
                if ($order->type === 'sale') {
                    // Revert: Increase balance back
                    $party->increment('balance', $order->total_amount);
                    
                    Transaction::create([
                        'party_id' => $party->id,
                        'order_id' => $order->id,
                        'type' => 'debit', // Revert: Debit again
                        'amount' => $order->total_amount,
                        'description' => 'Payment Reverted for Order #' . $order->id,
                        'transaction_date' => now(),
                    ]);
                } else {
                    // Revert: Decrease balance back
                    $party->decrement('balance', $order->total_amount);

                    Transaction::create([
                        'party_id' => $party->id,
                        'order_id' => $order->id,
                        'type' => 'credit', // Revert: Credit again
                        'amount' => $order->total_amount,
                        'description' => 'Payment Reverted for Order #' . $order->id,
                        'transaction_date' => now(),
                    ]);
                }
            }

            $order->update($validated);
        });

        return back();
    }

    public function print(Order $order)
    {
        $order->load(['party', 'items.product', 'items.productSet', 'items.attar']);
        $settings = \App\Models\Setting::all()->pluck('value', 'key');
        return view('invoices.print', compact('order', 'settings'));
    }
}
