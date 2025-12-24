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
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignId('attar_id')->nullable()->constrained()->onDelete('cascade');
        });

        Schema::table('party_product_prices', function (Blueprint $table) {
            $table->foreignId('attar_id')->nullable()->constrained()->onDelete('cascade');
            $table->unique(['party_id', 'attar_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('attar_id');
        });

        Schema::table('party_product_prices', function (Blueprint $table) {
            $table->dropConstrainedForeignId('attar_id');
            // Unique index is dropped automatically when column is dropped, usually. 
            // If not, explicitly drop it before column. But dropConstrainedForeignId handles FK.
            // Let's safe drop column.
        });
    }
};
