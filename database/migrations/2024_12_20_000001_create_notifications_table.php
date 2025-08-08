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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // success, error, warning, info
            $table->string('title');
            $table->text('message');
            $table->string('category')->nullable(); // grievance, system, user, admin
            $table->boolean('read')->default(false);
            $table->json('data')->nullable(); // Additional data
            $table->timestamps();
            
            $table->index(['user_id', 'read']);
            $table->index(['category', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
}; 