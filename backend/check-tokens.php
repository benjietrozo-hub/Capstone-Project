<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Admin;

echo "=== CHECKING TOKENS ===\n\n";

// Check if personal_access_tokens table exists
$tables = DB::select("SHOW TABLES LIKE 'personal_access_tokens'");
if (empty($tables)) {
    echo "❌ Table 'personal_access_tokens' does not exist!\n";
    echo "Run: php artisan migrate\n";
    exit(1);
}

echo "✅ Table 'personal_access_tokens' exists\n\n";

// Get all tokens
$tokens = DB::table('personal_access_tokens')->get();
echo "Total tokens: " . $tokens->count() . "\n\n";

if ($tokens->count() > 0) {
    echo "Tokens:\n";
    foreach ($tokens as $token) {
        echo "  ID: {$token->id}\n";
        echo "  Tokenable Type: {$token->tokenable_type}\n";
        echo "  Tokenable ID: {$token->tokenable_id}\n";
        echo "  Name: {$token->name}\n";
        echo "  Created: {$token->created_at}\n";
        echo "  ---\n";
    }
} else {
    echo "No tokens found!\n";
}

echo "\n=== DONE ===\n";
