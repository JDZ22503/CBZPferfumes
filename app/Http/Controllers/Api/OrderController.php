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
use App\Models\OrderMessage;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $status = $request->query('status', '');
        $query = Order::with(['party', 'items.product', 'items.productSet', 'items.attar'])->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhereHas('party', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($request->has('from_date') && $request->from_date) {
            $query->whereDate('order_date', '>=', $request->from_date);
        }

        if ($request->has('to_date') && $request->to_date) {
            $query->whereDate('order_date', '<=', $request->to_date);
        }

        return response()->json($query->paginate(10));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'party_id' => 'required|exists:parties,id',
            'order_date' => 'required|date',
            'type' => 'required|in:sale,purchase',
            'payment_status' => 'required|in:paid,unpaid,partial',
            'paid_amount' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|required_without_all:items.*.product_set_id,items.*.attar_id|exists:products,id',
            'items.*.product_set_id' => 'nullable|required_without_all:items.*.product_id,items.*.attar_id|exists:product_sets,id',
            'items.*.attar_id' => 'nullable|required_without_all:items.*.product_id,items.*.product_set_id|exists:attars,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $order = DB::transaction(function () use ($validated, $request) {
            $totalAmount = 0;
            foreach ($validated['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            $settings = Setting::pluck('value', 'key');
            $gstRate = (float)($settings['gst_rate'] ?? 18);
            $totalAmountWithGst = $totalAmount * (1 + ($gstRate / 100));

            $party = Party::find($validated['party_id']);
            $paidAmount = $validated['payment_status'] === 'partial' ? ($validated['paid_amount'] ?? 0) : ($validated['payment_status'] === 'paid' ? $totalAmountWithGst : 0);
            $dueAmount = round($totalAmountWithGst - $paidAmount, 2);

            $order = Order::create([
                'party_id' => $validated['party_id'],
                'order_date' => $validated['order_date'],
                'status' => 'pending', 
                'payment_status' => $validated['payment_status'],
                'paid_amount' => $paidAmount,
                'due_amount' => $dueAmount,
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

                /** @var \App\Models\Product|\App\Models\ProductSet|\App\Models\Attar $product */

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
                Party::where('id', $party->id)->increment('balance', $totalAmountWithGst);
                
                Transaction::create([
                    'party_id' => $party->id,
                    'order_id' => $order->id,
                    'type' => 'debit',
                    'amount' => $totalAmountWithGst,
                    'description' => 'Sale Order #' . $order->id,
                    'transaction_date' => $validated['order_date'],
                ]);
            } else {
                Party::where('id', $party->id)->decrement('balance', $totalAmountWithGst);

                Transaction::create([
                    'party_id' => $party->id,
                    'order_id' => $order->id,
                    'type' => 'credit',
                    'amount' => $totalAmountWithGst,
                    'description' => 'Purchase Order #' . $order->id,
                    'transaction_date' => $validated['order_date'],
                ]);
            }

            if ($request->has('message') && !empty($request->message)) {
                OrderMessage::create([
                    'order_id' => $order->id,
                    'message' => $request->message
                ]);
            }

            $order->refresh();

            // 3. Handle Initial Payment Transaction
            $actualPaid = (float)($validated['paid_amount'] ?? $order->paid_amount ?? 0);
            if ($actualPaid > 0) {
                if ($order->type === 'sale') {
                    // Sale: Customer pays us (Credit)
                    Party::where('id', $party->id)->decrement('balance', $actualPaid);
                    Transaction::create([
                        'party_id' => $party->id,
                        'order_id' => $order->id,
                        'type' => 'credit',
                        'amount' => $actualPaid,
                        'description' => 'Payment Received for Order #' . $order->id . ($order->payment_status === 'partial' ? ' (Partial)' : ''),
                        'transaction_date' => $order->order_date,
                    ]);
                } else {
                    // Purchase: We pay supplier (Debit)
                    Party::where('id', $party->id)->increment('balance', $actualPaid);
                    Transaction::create([
                        'party_id' => $party->id,
                        'order_id' => $order->id,
                        'type' => 'debit',
                        'amount' => $actualPaid,
                        'description' => 'Payment Made for Order #' . $order->id . ($order->payment_status === 'partial' ? ' (Partial)' : ''),
                        'transaction_date' => $order->order_date,
                    ]);
                }
            }

            return $order;
        });

        // Use method_exists check as a fallback if the user hasn't updated the model yet
        $relations = ['party', 'items.product', 'items.productSet', 'items.attar'];
        if (method_exists($order, 'messages')) {
            $relations[] = 'messages';
        }
        if (method_exists($order, 'transactions')) {
            $relations[] = 'transactions';
        }

        return response()->json($order->load($relations), 201);
    }

    public function show(Order $order)
    {
        $relations = ['party', 'items.product', 'items.productSet', 'items.attar'];
        if (method_exists($order, 'messages')) {
            $relations[] = 'messages';
        }
        if (method_exists($order, 'transactions')) {
            $relations[] = 'transactions';
        }
        return response()->json($order->load($relations));
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,completed,cancelled',
            'payment_status' => 'required|in:paid,unpaid,partial',
            'paid_amount' => 'nullable|numeric|min:0',
            'message' => 'nullable|string',
            'items' => 'nullable|array|min:1',
            'items.*.id' => 'nullable|exists:order_items,id',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
        ]);

        $order = DB::transaction(function () use ($validated, $order, $request) {
            $party = $order->party;
            $oldTotalAmount = (float) $order->total_amount;
            $oldPaidAmount = (float) ($order->paid_amount ?? 0);

            // 1. Handle Items Update (Total Amount Change)
            if (isset($validated['items'])) {
                $itemsTotal = 0;
                $billItemsJson = [];

                foreach ($validated['items'] as $itemData) {
                    $orderItem = OrderItem::find($itemData['id']);
                    if ($orderItem && $orderItem->order_id === $order->id) {
                        $qtyDiff = $itemData['quantity'] - $orderItem->quantity;
                        $product = $orderItem->product ?? $orderItem->productSet ?? $orderItem->attar;
                        
                        if ($order->type === 'sale' && $product && $product->stock) {
                            if ($qtyDiff > 0) $product->stock()->decrement('quantity', $qtyDiff);
                            elseif ($qtyDiff < 0) $product->stock()->increment('quantity', abs($qtyDiff));
                        } elseif ($order->type === 'purchase' && $product && $product->stock) {
                            if ($qtyDiff > 0) $product->stock()->increment('quantity', $qtyDiff);
                            elseif ($qtyDiff < 0) $product->stock()->decrement('quantity', abs($qtyDiff));
                        }

                        $orderItem->update([
                            'quantity' => $itemData['quantity'],
                            'unit_price' => $itemData['unit_price'],
                            'total_price' => $itemData['quantity'] * $itemData['unit_price']
                        ]);

                        $itemsTotal += $orderItem->total_price;
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
                $newTotalAmount = round($itemsTotal * (1 + ($gstRate / 100)), 2);

                if ($newTotalAmount != $oldTotalAmount) {
                    $totalDiff = round($newTotalAmount - $oldTotalAmount, 2);
                    if ($order->type === 'sale') {
                        $party->increment('balance', $totalDiff);
                    } else {
                        $party->decrement('balance', $totalDiff);
                    }
                    $order->total_amount = $newTotalAmount;
                    $order->bill_details = array_merge($order->bill_details ?? [], ['items' => $billItemsJson]);
                }
            }

            $newTotalAmount = (float) $order->total_amount;

            // 2. Determine New Paid Amount based on Status
            $newPaidAmount = $oldPaidAmount;
            if ($validated['payment_status'] === 'paid') {
                $newPaidAmount = $newTotalAmount;
            } elseif ($validated['payment_status'] === 'unpaid') {
                $newPaidAmount = 0;
            } elseif ($validated['payment_status'] === 'partial') {
                $newPaidAmount = (float) ($validated['paid_amount'] ?? 0);
            }

            // 3. Handle Payment Difference (Transactions)
            $paidDiff = round($newPaidAmount - $oldPaidAmount, 2);
            if ($paidDiff != 0) {
                $type = '';
                if ($order->type === 'sale') {
                    $type = $paidDiff > 0 ? 'credit' : 'debit';
                    $party->decrement('balance', $paidDiff);
                } else {
                    $type = $paidDiff > 0 ? 'debit' : 'credit';
                    $party->increment('balance', $paidDiff);
                }

                Transaction::create([
                    'party_id' => $party->id,
                    'order_id' => $order->id,
                    'type' => $type,
                    'amount' => abs($paidDiff),
                    'description' => ($paidDiff > 0 ? 'Payment Received' : 'Payment Corrected') . ' for Order #' . $order->id . ' (Amount: ₹' . number_format(abs($paidDiff), 2) . ')',
                    'transaction_date' => now(),
                ]);
            }

            // 4. Handle Messages
            if ($request->has('message') && !empty($validated['message'])) {
                OrderMessage::create([
                    'order_id' => $order->id,
                    'message' => $validated['message']
                ]);
                $order->message = $validated['message'];
            }

            // 5. Update Order Record
            $order->status = $validated['status'];
            $order->payment_status = $validated['payment_status'];
            $order->paid_amount = $newPaidAmount;
            $order->due_amount = round($newTotalAmount - $newPaidAmount, 2);
            $order->save();

            return $order;
        });

        $relations = ['party', 'items.product', 'items.productSet', 'items.attar'];
        if (method_exists($order, 'messages')) {
            $relations[] = 'messages';
        }
        if (method_exists($order, 'transactions')) {
            $relations[] = 'transactions';
        }

        return response()->json($order->load($relations));
    }
    public function downloadInvoice(Order $order)
    {
        $settings = Setting::pluck('value', 'key')->all();
        $order->load(['party', 'items.product', 'items.productSet', 'items.attar']);

        $html = view('invoices.print', compact('order', 'settings'))->render();
        return response()->json(['html' => $html]);
    }
    public function destroyMessage($id)
    {
        $message = OrderMessage::findOrFail($id);
        $message->delete();
        return response()->json(['message' => 'Message deleted successfully']);
    }
}

