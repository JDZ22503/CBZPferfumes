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

            // Apply GST
            $settings = \App\Models\Setting::pluck('value', 'key'); // Optimized pluck
            $gstRate = (float)($settings['gst_rate'] ?? 18);
            $totalAmountWithGst = $totalAmount * (1 + ($gstRate / 100));

            $order = Order::create([
                'party_id' => $validated['party_id'],
                'order_date' => $validated['order_date'],
                'status' => 'pending', 
                'payment_status' => 'unpaid',
                'total_amount' => $totalAmountWithGst,
                'type' => $validated['type'],
            ]);

            $billItemsJson = [];

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

                // Add to Bill Items JSON
                $billItemsJson[] = [
                    'name' => $product->name,
                    'sku' => $product->sku ?? '-',
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                    'type' => $productId ? 'product' : ($productSetId ? 'set' : 'attar'),
                ];

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
            
            // Save Bill Details Snapshot
            $order->update([
                'bill_details' => [
                    'party_name' => $party->name,
                    'party_phone' => $party->phone,
                    'party_address' => $party->address,
                    'party_email' => $party->email,
                    'items' => $billItemsJson,
                ]
            ]);

            if ($validated['type'] === 'sale') {
                $party->increment('balance', $totalAmountWithGst);
                
                Transaction::create([
                    'party_id' => $party->id,
                    'order_id' => $order->id,
                    'type' => 'debit', // Debit the party (they owe us)
                    'amount' => $totalAmountWithGst,
                    'description' => 'Sale Order #' . $order->id,
                    'transaction_date' => $validated['order_date'],
                ]);
            } else {
                $party->decrement('balance', $totalAmountWithGst);

                Transaction::create([
                    'party_id' => $party->id,
                    'order_id' => $order->id,
                    'type' => 'credit', // Credit the party (we owe them)
                    'amount' => $totalAmountWithGst,
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
            'items' => 'nullable|array',
            'items.*.id' => 'required_with:items|exists:order_items,id',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $order, $request) {
            // 1. Handle Item Updates (Qty, Price, Stock, Order Total)
            if ($request->has('items')) {
                $oldTotalWithGst = $order->total_amount;
                $newSubTotal = 0;
                $settings = \App\Models\Setting::pluck('value', 'key');
                $gstRate = (float)($settings['gst_rate'] ?? 18);

                foreach ($validated['items'] as $itemData) {
                    $dbItem = OrderItem::find($itemData['id']);
                    
                    // Security check: ensure item belongs to order
                    if ($dbItem->order_id !== $order->id) continue;

                    $qtyDiff = $itemData['quantity'] - $dbItem->quantity;

                    // Update Stock if quantity changed
                    if ($qtyDiff != 0) {
                        $product = $dbItem->product ?? $dbItem->productSet ?? $dbItem->attar;
                        if ($product && $product->stock) {
                            if ($order->type === 'sale') {
                                // Sale: Increasing qty means decreasing stock
                                if ($qtyDiff > 0) {
                                    $product->stock()->decrement('quantity', $qtyDiff);
                                } else {
                                    $product->stock()->increment('quantity', abs($qtyDiff));
                                }
                            } else {
                                // Purchase: Increasing qty means increasing stock
                                if ($qtyDiff > 0) {
                                    $product->stock()->increment('quantity', $qtyDiff);
                                } else {
                                    $product->stock()->decrement('quantity', abs($qtyDiff));
                                }
                            }
                        }
                    }

                    // Update Item
                    $dbItem->update([
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'total_price' => $itemData['quantity'] * $itemData['unit_price']
                    ]);

                    $newSubTotal += $dbItem->total_price;
                }

                $newTotalWithGst = $newSubTotal * (1 + ($gstRate / 100));
                
                // Update Order Total
                $order->update(['total_amount' => $newTotalWithGst]);

                // Update Party Balance
                $diff = $newTotalWithGst - $oldTotalWithGst;
                if ($diff != 0) {
                     if ($order->type === 'sale') {
                        $order->party()->increment('balance', $diff);
                     } else {
                        $order->party()->decrement('balance', $diff);
                     }
                }

                // Update Original Transaction (The one created when order was made)
                // We assume it's the one matching the order ID and type (debit for sale, credit for purchase) 
                // AND description usually contains "Order #"
                $transactionType = $order->type === 'sale' ? 'debit' : 'credit';
                Transaction::where('order_id', $order->id)
                    ->where('type', $transactionType)
                    ->where('description', 'like', '%Order #%')
                    ->update(['amount' => $newTotalWithGst]);
                
                // Force update of bill_details since items changed
                $order->refresh(); // Reload items
                $order->load(['party', 'items.product', 'items.productSet', 'items.attar']);
                
                $billItemsJson = [];
                foreach ($order->items as $item) {
                     $product = $item->product ?? $item->productSet ?? $item->attar;
                     $billItemsJson[] = [
                        'name' => $product ? $product->name : 'Unknown Item',
                        'sku' => $product ? ($product->sku ?? '-') : '-',
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'total_price' => $item->total_price,
                        'type' => $item->product_id ? 'product' : ($item->product_set_id ? 'set' : ($item->attar_id ? 'attar' : 'unknown')),
                     ];
                }
                
                $order->update([
                    'bill_details' => [
                        'party_name' => $order->party->name,
                        'party_phone' => $order->party->phone,
                        'party_address' => $order->party->address,
                        'party_email' => $order->party->email,
                        'items' => $billItemsJson,
                    ]
                ]);
            }

            // 2. Handle Payment Status Change (Existing Logic)
            if ($order->payment_status !== 'paid' && $validated['payment_status'] === 'paid') {
                $party = $order->party;
                if ($order->type === 'sale') {
                    $party->decrement('balance', $order->total_amount);
                    Transaction::create([
                        'party_id' => $party->id,
                        'order_id' => $order->id,
                        'type' => 'credit',
                        'amount' => $order->total_amount,
                        'description' => 'Payment Received for Order #' . $order->id,
                        'transaction_date' => now(),
                    ]);
                } else {
                    $party->increment('balance', $order->total_amount);
                    Transaction::create([
                        'party_id' => $party->id,
                        'order_id' => $order->id,
                        'type' => 'debit',
                        'amount' => $order->total_amount,
                        'description' => 'Payment Made for Order #' . $order->id,
                        'transaction_date' => now(),
                    ]);
                }
            }
            elseif ($order->payment_status === 'paid' && $validated['payment_status'] !== 'paid') {
                $party = $order->party;
                if ($order->type === 'sale') {
                    $party->increment('balance', $order->total_amount);
                    Transaction::create([
                        'party_id' => $party->id,
                        'order_id' => $order->id,
                        'type' => 'debit',
                        'amount' => $order->total_amount,
                        'description' => 'Payment Reverted for Order #' . $order->id,
                        'transaction_date' => now(),
                    ]);
                } else {
                    $party->decrement('balance', $order->total_amount);
                    Transaction::create([
                        'party_id' => $party->id,
                        'order_id' => $order->id,
                        'type' => 'credit',
                        'amount' => $order->total_amount,
                        'description' => 'Payment Reverted for Order #' . $order->id,
                        'transaction_date' => now(),
                    ]);
                }
            }

            // 3. Update Order Main Fields
            $updateData = [
                'status' => $validated['status'],
                'payment_status' => $validated['payment_status'],
                'message' => $validated['message'] ?? null,
            ];
            
            // If we didn't update items logic above (e.g. no items in request - which shouldn't happen with our Modal but good fallback), we might need to backfill bill_details
            if (!$request->has('items') && empty($order->bill_details)) {
                 $order->load(['party', 'items.product', 'items.productSet', 'items.attar']);
                 $billItemsJson = []; // ... (logic repeated or extract function? Let's just backfill if strictly needed, or rely on the fact user uses the modal which sends items now)
                 // For now, assume modal usage. The logic from previous turn (backfill) is implicitly replaced.
                 // If we want to keep backfill for status-only updates from other places:
                 foreach ($order->items as $item) {
                     $product = $item->product ?? $item->productSet ?? $item->attar;
                     $billItemsJson[] = [
                         'name' => $product ? $product->name : 'Unknown Item',
                         'sku' => $product ? ($product->sku ?? '-') : '-',
                         'quantity' => $item->quantity,
                         'unit_price' => $item->unit_price,
                         'total_price' => $item->total_price,
                         'type' => $item->product_id ? 'product' : ($item->product_set_id ? 'set' : ($item->attar_id ? 'attar' : 'unknown')),
                     ];
                 }
                 $updateData['bill_details'] = [
                    'party_name' => $order->party->name,
                    'party_phone' => $order->party->phone,
                    'party_address' => $order->party->address,
                    'party_email' => $order->party->email,
                    'items' => $billItemsJson,
                 ];
            }

            $order->update($updateData);
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
