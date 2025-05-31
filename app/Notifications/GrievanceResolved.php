<?php

namespace App\Notifications;

use App\Models\Grievance;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class GrievanceResolved extends Notification implements ShouldQueue
{
    use Queueable;

    protected $grievance;
    protected $resolutionMessage;

    public function __construct(Grievance $grievance, string $resolutionMessage)
    {
        $this->grievance = $grievance;
        $this->resolutionMessage = $resolutionMessage;
    }

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Grievance Has Been Resolved')
            ->greeting('Hello ' . $notifiable->name)
            ->line('Your grievance (ID: ' . $this->grievance->grievance_id . ') has been resolved.')
            ->line('Subject: ' . $this->grievance->subject)
            ->line('Resolution Message: ' . $this->resolutionMessage)
            ->action('View Details', route('dashboard'))
            ->line('Thank you for using our grievance system.');
    }

    public function toArray($notifiable): array
    {
        return [
            'grievance_id' => $this->grievance->grievance_id,
            'subject' => $this->grievance->subject,
            'resolution_message' => $this->resolutionMessage,
            'type' => 'grievance_resolved'
        ];
    }
} 