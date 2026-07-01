<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users');
            $table->foreignId('plan_id')->constrained('plans');
            $table->unsignedInteger('custom_max_barberias')->nullable();
            $table->unsignedInteger('custom_max_barberos')->nullable();
            $table->enum('status', ['trial', 'active', 'past_due', 'cancelled'])->default('trial');
            $table->date('starts_at');
            $table->date('trial_ends_at')->nullable();
            $table->date('ends_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
