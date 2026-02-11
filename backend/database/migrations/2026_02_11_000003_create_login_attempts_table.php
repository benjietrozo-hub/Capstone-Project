<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('login_attempts', function (Blueprint $table) {
            $table->id();
            $table->string('identifier'); // username or email
            $table->string('ip_address');
            $table->integer('batch')->default(1); // 1, 2, 3, or 4 (locked)
            $table->integer('attempts_in_batch')->default(0);
            $table->timestamp('locked_until')->nullable();
            $table->timestamps();
            
            $table->index(['identifier', 'ip_address']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('login_attempts');
    }
};
