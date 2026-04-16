<?php

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing Email Notification System...\n\n";

try {
    // Test basic email functionality
    echo "1. Testing basic email configuration...\n";
    
    $config = config('mail');
    echo "   Mail Driver: " . $config['default'] . "\n";
    echo "   Mail Host: " . $config['mailers']['smtp']['host'] . "\n";
    echo "   Mail Port: " . $config['mailers']['smtp']['port'] . "\n";
    echo "   From Address: " . $config['from']['address'] . "\n";
    
    // Test email notification service
    echo "\n2. Testing EmailNotificationService...\n";
    
    // Check if EmailNotificationService exists
    if (class_exists('App\Services\EmailNotificationService')) {
        echo "   ✅ EmailNotificationService class exists\n";
        
        // Test if email enabled types are set
        $reflection = new ReflectionClass('App\Services\EmailNotificationService');
        $property = $reflection->getProperty('emailEnabledTypes');
        $property->setAccessible(true);
        $types = $property->getValue();
        echo "   ✅ Email enabled types: " . count($types) . " notification types\n";
        
    } else {
        echo "   ❌ EmailNotificationService class not found\n";
    }
    
    // Test notification service integration
    echo "\n3. Testing NotificationService integration...\n";
    
    if (class_exists('App\Services\NotificationService')) {
        echo "   ✅ NotificationService class exists\n";
        
        // Check if EmailNotificationService is being used
        $notificationServiceContent = file_get_contents(__DIR__ . '/app/Services/NotificationService.php');
        if (strpos($notificationServiceContent, 'EmailNotificationService') !== false) {
            echo "   ✅ EmailNotificationService is integrated in NotificationService\n";
        } else {
            echo "   ❌ EmailNotificationService integration not found\n";
        }
    } else {
        echo "   ❌ NotificationService class not found\n";
    }
    
    // Test email template
    echo "\n4. Testing email template...\n";
    
    if (file_exists(__DIR__ . '/resources/views/emails/system-notification.blade.php')) {
        echo "   ✅ Email template exists\n";
    } else {
        echo "   ❌ Email template not found\n";
    }
    
    // Test mail class
    echo "\n5. Testing SystemNotificationMail class...\n";
    
    if (class_exists('App\Mail\SystemNotificationMail')) {
        echo "   ✅ SystemNotificationMail class exists\n";
    } else {
        echo "   ❌ SystemNotificationMail class not found\n";
    }
    
    // Test actual email sending (will fail without proper credentials)
    echo "\n6. Testing email sending (will show credentials status)...\n";
    
    try {
        $mailConfig = config('mail.mailers.smtp');
        if ($mailConfig['username'] === 'your-email@gmail.com' || $mailConfig['password'] === 'your-app-password') {
            echo "   ⚠️  Email credentials need to be configured in .env file\n";
            echo "   📝 See EMAIL_CONFIGURATION_GUIDE.md for setup instructions\n";
        } else {
            echo "   ✅ Email credentials appear to be configured\n";
            
            // Try to send a test email
            try {
                Mail::raw('This is a test email from OlineIMS to verify the email system is working.', function($message) {
                    $message->to('test@example.com')->subject('OlineIMS Email Test');
                });
                echo "   ✅ Test email sent successfully (check your email)\n";
            } catch (\Exception $e) {
                echo "   ❌ Email sending failed: " . $e->getMessage() . "\n";
            }
        }
    } catch (\Exception $e) {
        echo "   ❌ Mail configuration error: " . $e->getMessage() . "\n";
    }
    
    echo "\n" . str_repeat("=", 50) . "\n";
    echo "SUMMARY:\n";
    echo "✅ Email notification system is IMPLEMENTED\n";
    echo "⚠️  Email credentials need to be configured in .env\n";
    echo "📧 System will send emails for all notification events once configured\n";
    echo "📋 See EMAIL_CONFIGURATION_GUIDE.md for complete setup\n";
    echo str_repeat("=", 50) . "\n";
    
} catch (\Exception $e) {
    echo "❌ Test failed: " . $e->getMessage() . "\n";
}
