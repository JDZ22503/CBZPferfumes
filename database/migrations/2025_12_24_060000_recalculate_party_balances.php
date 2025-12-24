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
        $parties = \App\Models\Party::all();

        foreach ($parties as $party) {
            // Calculate balance from transactions
            // Assuming for Customers: Debit is positive (Receivable), Credit is negative (Paid)
            // Assuming for Suppliers: Credit is positive (Payable), Debit is negative (Paid)
            
            // However, typically in this system (based on earlier context), 
            // 'balance' field is purely numerical magnitude often, signed by type?
            // Let's look at the Party model logic or Order logic.
            // In debug_party.php: Customer, Balance 11950.98 (Positive). 
            // Transactions: Debit 5894.10, Debit 5157.78.
            // So Debit adds to Customer Balance.
            
            $debits = \App\Models\Transaction::where('party_id', $party->id)
                        ->where('type', 'debit')
                        ->sum('amount');
                        
            $credits = \App\Models\Transaction::where('party_id', $party->id)
                        ->where('type', 'credit')
                        ->sum('amount');
            
            $newBalance = 0;
            
            if ($party->type === 'customer') {
                // Customer: Debits (Sales) increase balance (Money owed to us)
                // Credits (Payments) decrease balance
                $newBalance = $debits - $credits;
            } else {
                // Supplier: Credits (Purchases) increase balance (Money we owe)
                // Debits (Payments) decrease balance
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
        // No revert possible for recalculation
    }
};
