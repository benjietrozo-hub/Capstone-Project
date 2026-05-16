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
        Schema::table('teachers', function (Blueprint $table) {
            $table->boolean('password_change_required')->default(false)->after('password');
            $table->string('otp_code')->nullable()->after('password_change_required');
            $table->timestamp('otp_expires_at')->nullable()->after('otp_code');
        });

        Schema::table('admins', function (Blueprint $table) {
            $table->boolean('password_change_required')->default(false)->after('password');
            $table->string('otp_code')->nullable()->after('password_change_required');
            $table->timestamp('otp_expires_at')->nullable()->after('otp_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->dropColumn(['password_change_required', 'otp_code', 'otp_expires_at']);
        });

        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn(['password_change_required', 'otp_code', 'otp_expires_at']);
        });
    }
};
