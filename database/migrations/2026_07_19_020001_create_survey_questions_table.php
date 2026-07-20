<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('survey_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('survey_id')->constrained('surveys')->cascadeOnDelete();
            $table->enum('type', ['rating', 'text']);
            $table->string('question_text');
            $table->unsignedInteger('order')->default(0);
            $table->unsignedInteger('scale_min')->nullable()->default(1);
            $table->unsignedInteger('scale_max')->nullable()->default(5);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('survey_questions');
    }
};
