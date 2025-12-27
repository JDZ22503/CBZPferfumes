<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductSet;
use App\Models\Attar;
use App\Models\Party;
use App\Models\Transaction;
use App\Models\Setting;
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

        return response()->json($query->paginate(10));
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

        $order = DB::transaction(function () use ($validated) {
            $totalAmount = 0;
            foreach ($validated['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            $settings = Setting::pluck('value', 'key');
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

                if ($productId) {
                    $product = Product::find($productId);
                } elseif ($productSetId) {
                    $product = ProductSet::find($productSetId);
                } else {
                    $product = Attar::find($attarId);
                }

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

            $party = Party::find($validated['party_id']);
            
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
                    'type' => 'debit',
                    'amount' => $totalAmountWithGst,
                    'description' => 'Sale Order #' . $order->id,
                    'transaction_date' => $validated['order_date'],
                ]);
            } else {
                $party->decrement('balance', $totalAmountWithGst);

                Transaction::create([
                    'party_id' => $party->id,
                    'order_id' => $order->id,
                    'type' => 'credit',
                    'amount' => $totalAmountWithGst,
                    'description' => 'Purchase Order #' . $order->id,
                    'transaction_date' => $validated['order_date'],
                ]);
            }

            return $order;
        });

        return response()->json($order, 201);
    }

    public function show(Order $order)
    {
        return response()->json($order->load(['party', 'items.product', 'items.productSet', 'items.attar']));
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,completed,cancelled',
            'payment_status' => 'required|in:paid,unpaid,partial',
            'message' => 'nullable|string',
            'items' => 'nullable|array|min:1',
            'items.*.id' => 'nullable|exists:order_items,id',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
        ]);

        $order = DB::transaction(function () use ($validated, $order) {
            // 1. Handle Status Changes (Payment logic) - Existing logic
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

            // 2. Handle Items Update if present
            if (isset($validated['items'])) {
                $totalAmount = 0;
                $billItemsJson = [];

                foreach ($validated['items'] as $itemData) {
                    $orderItem = OrderItem::find($itemData['id']);
                    if ($orderItem && $orderItem->order_id === $order->id) {
                        // Update existing item
                        // Stock adjustment (simplified: revert old, apply new)
                        // Note: For perfect stock accuracy, we should diff the qty.
                        $qtyDiff = $itemData['quantity'] - $orderItem->quantity;

                        $product = $orderItem->product ?? $orderItem->productSet ?? $orderItem->attar;
                        
                        if ($order->type === 'sale' && $product && $product->stock) {
                            if ($qtyDiff > 0) $product->stock()->decrement('quantity', $qtyDiff);
                            elseif ($qtyDiff < 0) $product->stock()->increment('quantity', abs($qtyDiff));
                        } elseif ($order->type === 'purchase' && $product) {
                             if ($product->stock) {
                                if ($qtyDiff > 0) $product->stock()->increment('quantity', $qtyDiff);
                                elseif ($qtyDiff < 0) $product->stock()->decrement('quantity', abs($qtyDiff));
                             }
                        }

                        $orderItem->update([
                            'quantity' => $itemData['quantity'],
                            'unit_price' => $itemData['unit_price'],
                            'total_price' => $itemData['quantity'] * $itemData['unit_price']
                        ]);

                        $totalAmount += $orderItem->total_price;

                        // Add to Bill JSON
                        $billItemsJson[] = [
                            'name' => $product ? $product->name : 'Unknown',
                            'sku' => $product->sku ?? '-',
                            'quantity' => $itemData['quantity'],
                            'unit_price' => $itemData['unit_price'],
                            'total_price' => $itemData['quantity'] * $itemData['unit_price'],
                            'type' => $orderItem->product_id ? 'product' : ($orderItem->product_set_id ? 'set' : 'attar'),
                        ];
                    }
                }

                $settings = Setting::pluck('value', 'key');
                $gstRate = (float)($settings['gst_rate'] ?? 18);
                $totalAmountWithGst = $totalAmount * (1 + ($gstRate / 100));

                $validated['total_amount'] = $totalAmountWithGst;

                // Update Bill Details
                 $order->update([
                    'bill_details' => [
                        'party_name' => $order->party->name,
                        'party_phone' => $order->party->phone,
                        'party_address' => $order->party->address,
                        'party_email' => $order->party->email,
                        'items' => $billItemsJson,
                    ],
                    'total_amount' => $totalAmountWithGst
                ]);
            }

            $order->update(collect($validated)->except(['items', 'total_amount'])->toArray()); // Total amount updated manually above

            return $order;
        });

        return response()->json($order);
    }
    public function downloadInvoice(Order $order)
    {
        $settings = Setting::pluck('value', 'key')->all();
        $order->load(['party', 'items.product', 'items.productSet', 'items.attar']);

        // Return the HTML view for the invoice
        // We will return it as a string so the mobile app can render/print it
        $html = view('invoices.print', compact('order', 'settings'))->render();

        // Strip the HTML2PDF script as we will use Expo Print
        // Be careful not to break the HTML structure
        // Simple string replace or just leave it, Expo Print might ignore it or we can handle it in App.
        
        return response()->json(['html' => $html]);
    }
}
