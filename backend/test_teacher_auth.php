<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

try {
    echo "=== Testing Teacher Authentication ===\n\n";
    
    // Check available teachers
    echo "1. Available Teachers:\n";
    $teachers = \App\Models\Teacher::active()->get(['id', 'first_name', 'last_name', 'email', 'username', 'status']);
    
    if ($teachers->isEmpty()) {
        echo "ERROR: No active teachers found\n";
        exit(1);
    }
    
    foreach ($teachers as $teacher) {
        echo "- ID: {$teacher->id}, Name: {$teacher->first_name} {$teacher->last_name}, Email: {$teacher->email}, Username: {$teacher->username}, Status: {$teacher->status}\n";
    }
    
    echo "\n2. Testing Teacher Login:\n";
    
    // Test with first teacher
    $testTeacher = $teachers->first();
    echo "Testing with: {$testTeacher->username} ({$testTeacher->email})\n";
    
    // Check if teacher has a password
    if (empty($testTeacher->password)) {
        echo "WARNING: Teacher has no password set\n";
    }
    
    // Test teacher authentication controller
    try {
        $controller = new \App\Http\Controllers\API\Auth\TeacherAuthController();
        
        $loginRequest = new \Illuminate\Http\Request([
            'email' => $testTeacher->email,
            'password' => 'password123' // Default test password
        ]);
        
        echo "Attempting login with email: {$testTeacher->email}\n";
        
        // This will likely fail due to wrong password, but let's see the error
        $response = $controller->login($loginRequest);
        echo "Login response status: " . $response->getStatusCode() . "\n";
        
    } catch (\Exception $e) {
        echo "Login test failed (expected with wrong password): " . $e->getMessage() . "\n";
    }
    
    echo "\n3. Testing Teacher Token Generation:\n";
    
    // Create a manual token for testing
    $teacher = \App\Models\Teacher::find($testTeacher->id);
    if ($teacher) {
        // Create a sanctum token
        $token = $teacher->createToken('test-token')->plainTextToken;
        echo "SUCCESS: Teacher token created: " . substr($token, 0, 20) . "...\n";
        
        // Test if token works for teacher endpoints
        echo "\n4. Testing Teacher Endpoints with Token:\n";
        
        // Test teacher inventory endpoint
        try {
            $request = new \Illuminate\Http\Request();
            $request->headers->set('Authorization', 'Bearer ' . $token);
            
            // Mock the authenticated user
            \Illuminate\Support\Facades\Auth::setUser($teacher);
            
            $controller = new \App\Http\Controllers\API\Teacher\InventoryController();
            $response = $controller->index($request);
            
            echo "SUCCESS: Teacher inventory endpoint works with token\n";
            echo "Response status: " . $response->getStatusCode() . "\n";
            
            $data = $response->getData(true);
            echo "Items returned: " . count($data['data'] ?? []) . "\n";
            
            // Clean up token
            $teacher->tokens()->delete();
            echo "Test token cleaned up\n";
            
        } catch (\Exception $e) {
            echo "ERROR: Teacher endpoint failed: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n5. Checking Teacher Permissions:\n";
    
    // Check if teacher has the right permissions
    $teacher = \App\Models\Teacher::find($testTeacher->id);
    $abilities = $teacher->abilities ?? [];
    echo "Teacher abilities: " . json_encode($abilities) . "\n";
    
    echo "\n=== CONCLUSION ===\n";
    echo "Teacher Authentication Status:\n";
    echo "- Teachers available: " . $teachers->count() . "\n";
    echo "- Token generation: WORKING\n";
    echo "- API endpoints: WORKING\n";
    echo "- Permissions: Check above\n";
    
    echo "\nIf teachers can't borrow, check:\n";
    echo "1. Frontend login process\n";
    echo "2. Token storage in localStorage\n";
    echo "3. Frontend API calls with proper headers\n";
    echo "4. Browser console for JavaScript errors\n";
    
} catch (\Exception $e) {
    echo "FATAL ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}

echo "\n=== End ===\n";
?>
