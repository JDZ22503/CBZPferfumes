<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $orders = \App\Models\Order::with('items')->get();
        $gstRate = 18; // Default GST Rate
        // If you can fetch setting here securely, do it, but 18 is likely safe assumption for historical fix or fetch via DB
        
        $settingGst = \Illuminate\Support\Facades\DB::table('settings')->where('key', 'gst_rate')->value('value');
        if($settingGst) {
             $gstRate = (float)$settingGst;
        }

        foreach ($orders as $order) {
            $subtotal = $order->items->sum('total_price');
            
            // Allow for small floating point differences
            if (abs($order->total_amount - $subtotal) < 1.00) {
                // It matches subtotal, meaning it lacks GST.
                // Apply GST
                $newTotal = $subtotal * (1 + ($gstRate / 100));
                
                // Update Order
                $order->total_amount = $newTotal;
                $order->save();
                
                // Update Transaction if it exists
                // We assume there's a transaction linked? Or multiple?
                // Logic in controller was creates 1 transaction. Can we find it?
                // Transactions don't have order_id in default model? But let's check migration
                // Yes, transactions table has order_id.
                
                \App\Models\Transaction::where('order_id', $order->id)
                    ->update(['amount' => $newTotal]);
                
                // Also update party balance?
                // If it was a sale, balance increased by subtotal. Needs to increase by (newTotal - subtotal).
                // If purchase, balance decreased by subtotal. Needs to decrease further.
                
                $diff = $newTotal - $subtotal;
                if ($order->type === 'sale') {
                    $order->party()->increment('balance', $diff);
                } else {
                    $order->party()->decrement('balance', $diff);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverting exact amounts is hard without knowing which ones were changed.
        // We generally don't revert data fix migrations perfectly.
    }
};
