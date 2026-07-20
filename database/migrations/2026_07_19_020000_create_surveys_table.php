<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('surveys', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('target_audience', ['owner', 'barber', 'both']);
            $table->boolean('active')->default(true);
            $table->date('starts_at')->nullable();
            $table->date('ends_at')->nullable();
            $table->enum('reward_type', ['none', 'coupon'])->default('none');
            $table->enum('reward_coupon_type', ['percentage', 'fixed'])->nullable();
            $table->decimal('reward_coupon_value', 10, 2)->nullable();
            $table->unsignedInteger('reward_coupon_duration_months')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('surveys');
    }
};
