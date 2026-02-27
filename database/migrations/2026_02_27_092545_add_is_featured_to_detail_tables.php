<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_details', function (Blueprint $table) {
            $table->boolean('is_featured')->default(false)->after('is_active');
        });

        Schema::table('attar_details', function (Blueprint $table) {
            $table->boolean('is_featured')->default(false)->after('is_active');
        });

        Schema::table('product_set_details', function (Blueprint $table) {
            $table->boolean('is_featured')->default(false)->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('product_details', function (Blueprint $table) {
            $table->dropColumn('is_featured');
        });

        Schema::table('attar_details', function (Blueprint $table) {
            $table->dropColumn('is_featured');
        });

        Schema::table('product_set_details', function (Blueprint $table) {
            $table->dropColumn('is_featured');
        });
    }
};
