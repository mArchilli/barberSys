<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'owner', 'barber'])->default('owner')->after('email');
            $table->foreignId('barberia_id')->nullable()->constrained('barberias')->after('role');
            $table->enum('salary_type', ['fixed', 'commission'])->nullable()->after('barberia_id');
            $table->decimal('salary_amount', 10, 2)->nullable()->after('salary_type');
            $table->decimal('commission_pct', 5, 2)->nullable()->after('salary_amount');
            $table->string('phone')->nullable()->after('commission_pct');
            $table->boolean('active')->default(true)->after('phone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('barberia_id');
            $table->dropColumn(['role', 'salary_type', 'salary_amount', 'commission_pct', 'phone', 'active']);
        });
    }
};
