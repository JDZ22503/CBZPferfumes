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
        Schema::table('products', function (Blueprint $table) {
            $table->string('hsn_code')->nullable()->after('sku');
        });

        Schema::table('product_sets', function (Blueprint $table) {
            $table->string('hsn_code')->nullable()->after('sku');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('hsn_code');
        });

        Schema::table('product_sets', function (Blueprint $table) {
            $table->dropColumn('hsn_code');
        });
    }
};
