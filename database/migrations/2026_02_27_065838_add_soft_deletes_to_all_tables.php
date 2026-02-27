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
        $tables = [
            'users',
            'parties',
            'products',
            'product_sets',
            'orders',
            'order_items',
            'stocks',
            'attars',
            'product_details',
            'attar_details',
            'product_set_details',
            'order_messages',
            'party_product_prices',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $table) {
                    $table->softDeletes();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'users',
            'parties',
            'products',
            'product_sets',
            'orders',
            'order_items',
            'stocks',
            'attars',
            'product_details',
            'attar_details',
            'product_set_details',
            'order_messages',
            'party_product_prices',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropSoftDeletes();
                });
            }
        }
    }
};
