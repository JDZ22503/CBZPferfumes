<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contact_details', function (Blueprint $table) {
            $table->string('whatsapp_link')->nullable()->after('instagram_link');
            $table->string('facebook_link')->nullable()->after('whatsapp_link');
        });
    }

    public function down(): void
    {
        Schema::table('contact_details', function (Blueprint $table) {
            $table->dropColumn(['whatsapp_link', 'facebook_link']);
        });
    }
};
