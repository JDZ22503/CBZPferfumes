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
        // 1. Delete transactions that are not linked to an order
        // The user verified those were creating the discrepancy
        \App\Models\Transaction::whereNull('order_id')->delete();

        // 2. Recalculate balances for all parties to ensure they match the Orders
        $parties = \App\Models\Party::all();

        foreach ($parties as $party) {
            
            // We can now safely sum transactions again, as the orphans are gone.
            // This preserves the Debit/Credit logic without rewriting it for Orders manually.
            
            $debits = \App\Models\Transaction::where('party_id', $party->id)
                        ->where('type', 'debit')
                        ->sum('amount');
                        
            $credits = \App\Models\Transaction::where('party_id', $party->id)
                        ->where('type', 'credit')
                        ->sum('amount');
            
            $newBalance = 0;
            
            if ($party->type === 'customer') {
                $newBalance = $debits - $credits;
            } else {
                $newBalance = $credits - $debits;
            }
            
            $party->balance = $newBalance;
            $party->save();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Cannot recover deleted transactions
    }
};
