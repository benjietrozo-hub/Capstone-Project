<?php

$host = '127.0.0.1';
$port = '3306';
$dbname = 'inventory_system';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== Fixing Teacher Passwords ===\n\n";
    
    // Check current teacher passwords
    echo "1. Checking current teacher passwords:\n";
    $stmt = $pdo->query("SELECT id, username, email, password FROM teachers WHERE status = 'active'");
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $teachersWithoutPasswords = [];
    foreach ($teachers as $teacher) {
        $hasPassword = !empty($teacher['password']) && $teacher['password'] !== '';
        echo "- {$teacher['username']} ({$teacher['email']}): " . ($hasPassword ? 'HAS PASSWORD' : 'NO PASSWORD') . "\n";
        
        if (!$hasPassword) {
            $teachersWithoutPasswords[] = $teacher;
        }
    }
    
    if (empty($teachersWithoutPasswords)) {
        echo "\nAll teachers already have passwords!\n";
        exit(0);
    }
    
    echo "\n2. Setting default passwords for teachers without passwords:\n";
    
    foreach ($teachersWithoutPasswords as $teacher) {
        // Default password: "password123" hashed with bcrypt
        $defaultPassword = 'password123';
        $hashedPassword = password_hash($defaultPassword, PASSWORD_BCRYPT);
        
        $stmt = $pdo->prepare("UPDATE teachers SET password = ? WHERE id = ?");
        $stmt->execute([$hashedPassword, $teacher['id']]);
        
        echo "- Set password for {$teacher['username']}: password123\n";
    }
    
    echo "\n3. Verification:\n";
    $stmt = $pdo->query("SELECT id, username, email, password FROM teachers WHERE status = 'active'");
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($teachers as $teacher) {
        $hasPassword = !empty($teacher['password']) && $teacher['password'] !== '';
        echo "- {$teacher['username']}: " . ($hasPassword ? 'HAS PASSWORD' : 'NO PASSWORD') . "\n";
    }
    
    echo "\n=== LOGIN CREDENTIALS ===\n";
    echo "Teachers can now log in with these credentials:\n";
    
    $stmt = $pdo->query("SELECT username, email FROM teachers WHERE status = 'active'");
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($teachers as $teacher) {
        echo "Username: {$teacher['username']} | Password: password123\n";
    }
    
    echo "\n=== NEXT STEPS ===\n";
    echo "1. Teachers can now log in with username and password\n";
    echo "2. After login, they should be able to browse inventory\n";
    echo "3. They should be able to submit borrow requests\n";
    echo "4. Admins can approve the requests in the admin panel\n";
    
} catch (PDOException $e) {
    echo "Database Error: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== End ===\n";
?>
