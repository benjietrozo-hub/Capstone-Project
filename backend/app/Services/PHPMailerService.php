<?php

namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Illuminate\Support\Facades\Log;

class PHPMailerService
{
    /**
     * Send an email using PHPMailer
     * 
     * @param string $recipientEmail
     * @param string $recipientName
     * @param string $subject
     * @param string $body
     * @return bool
     */
    public static function sendEmail($recipientEmail, $recipientName, $subject, $body)
    {
        $mail = new PHPMailer(true);

        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host       = config('mail.mailers.smtp.host', 'smtp.gmail.com');
            $mail->SMTPAuth   = true;
            $mail->Username   = 'benjie.trozo@csucc.edu.ph';
            $mail->Password   = config('services.phpmailer.password');
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;
            $mail->Timeout    = 15; // 15 seconds timeout
            $mail->SMTPKeepAlive = true;

            // Recipients
            $mail->setFrom('benjie.trozo@csucc.edu.ph', 'OIMS System');
            $mail->addAddress($recipientEmail, $recipientName);

            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $body;

            $mail->send();
            return true;
        } catch (Exception $e) {
            Log::error("PHPMailer Error: {$mail->ErrorInfo}");
            return false;
        }
    }

    /**
     * Send Welcome Email to New Teacher/Admin
     */
    public static function sendWelcomeEmail($user, $temporaryPassword)
    {
        $subject = "Welcome to PIMS - Your Account Credentials";
        $body = "
            <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                <h2 style='color: #2563eb;'>Hello, {$user->first_name}!</h2>
                <p>Welcome to the <strong>Property Inventory Management System (PIMS)</strong>. An account has been created for you.</p>
                <div style='background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                    <p><strong>Username:</strong> {$user->username}</p>
                    <p><strong>Temporary Password:</strong> <span style='color: #dc2626;'>{$temporaryPassword}</span></p>
                </div>
                <p><strong>Important:</strong> For security reasons, you are required to change your password during your first login.</p>
                <p>Please log in using the credentials above to set up your secure account.</p>
                <br>
                <p>Best regards,<br>The PIMS Administration</p>
            </div>
        ";

        return self::sendEmail($user->email, $user->full_name, $subject, $body);
    }

    /**
     * Send OTP for Password Reset
     */
    public static function sendOTPEmail($user, $otpCode)
    {
        $subject = "Your PIMS Verification Code";
        $body = "
            <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center;'>
                <h2 style='color: #2563eb;'>Security Verification</h2>
                <p>Your one-time password (OTP) for resetting your PIMS account password is:</p>
                <h1 style='letter-spacing: 5px; color: #1e40af; background: #eff6ff; display: inline-block; padding: 10px 20px; border-radius: 8px;'>{$otpCode}</h1>
                <p>This code is valid for <strong>3 minutes</strong>. Do not share this code with anyone.</p>
                <p>If you did not request this, please ignore this email.</p>
            </div>
        ";

        return self::sendEmail($user->email, $user->full_name, $subject, $body);
    }
}
