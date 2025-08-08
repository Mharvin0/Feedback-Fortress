<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grievances', function (Blueprint $table) {
            $table->id();
            $table->string('grievance_id')->unique(); // Unique ID for each grievance
            $table->string('subject');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['complaint', 'feedback']);
            $table->text('details');
            $table->enum('status', ['under_review', 'resolved', 'archived'])->default('under_review');
            $table->json('attachments')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grievances');
    }
}; 