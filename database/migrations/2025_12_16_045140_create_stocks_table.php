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
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->morphs('stockable');
            $table->integer('quantity')->default(0);
            $table->timestamps();
        });

        // Migrate existing data
        $products = \Illuminate\Support\Facades\DB::table('products')->get();
        foreach ($products as $product) {
            \Illuminate\Support\Facades\DB::table('stocks')->insert([
                'stockable_id' => $product->id,
                'stockable_type' => 'App\Models\Product', // Verify namespace
                'quantity' => $product->stock_quantity,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $productSets = \Illuminate\Support\Facades\DB::table('product_sets')->get();
        foreach ($productSets as $set) {
            \Illuminate\Support\Facades\DB::table('stocks')->insert([
                'stockable_id' => $set->id,
                'stockable_type' => 'App\Models\ProductSet', // Verify namespace
                'quantity' => $set->stock_quantity,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('stock_quantity');
        });

        Schema::table('product_sets', function (Blueprint $table) {
             $table->dropColumn('stock_quantity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->integer('stock_quantity')->default(0);
        });

        Schema::table('product_sets', function (Blueprint $table) {
            $table->integer('stock_quantity')->default(0);
        });

        // Restore data (Best effort)
        $stocks = \Illuminate\Support\Facades\DB::table('stocks')->get();
        foreach ($stocks as $stock) {
            if ($stock->stockable_type === 'App\Models\Product') {
                \Illuminate\Support\Facades\DB::table('products')
                    ->where('id', $stock->stockable_id)
                    ->update(['stock_quantity' => $stock->quantity]);
            } elseif ($stock->stockable_type === 'App\Models\ProductSet') {
                \Illuminate\Support\Facades\DB::table('product_sets')
                    ->where('id', $stock->stockable_id)
                    ->update(['stock_quantity' => $stock->quantity]);
            }
        }

        Schema::dropIfExists('stocks');
    }
};
