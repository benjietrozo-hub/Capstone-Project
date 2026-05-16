<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

use Illuminate\Contracts\Queue\ShouldQueue;

class SystemNotificationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $emailData;

    /**
     * Create a new message instance.
     */
    public function __construct(array $emailData)
    {
        $this->emailData = $emailData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->emailData['title'] . ' - OlineIMS Notification',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.system-notification',
            with: [
                'title' => $this->emailData['title'],
                'notificationMessage' => $this->emailData['message'],
                'type' => $this->emailData['type'],
                'userType' => $this->emailData['user_type'],
                'relatedId' => $this->emailData['related_id'] ?? null,
                'relatedType' => $this->emailData['related_type'] ?? null,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
