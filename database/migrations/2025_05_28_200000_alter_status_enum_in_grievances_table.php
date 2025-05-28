<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('grievances', function (Blueprint $table) {
            $table->enum('status', ['pending', 'under_review', 'resolved', 'archived'])->default('pending')->change();
        });
    }

    public function down(): void
    {
        Schema::table('grievances', function (Blueprint $table) {
            $table->enum('status', ['under_review', 'resolved', 'archived'])->default('under_review')->change();
        });
    }
}; 