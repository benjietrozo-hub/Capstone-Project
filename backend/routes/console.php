    <?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule return reminders
Schedule::command('reminders:send-return --days=1')
    ->dailyAt('09:00')
    ->name('send-return-reminders-1-day')
    ->description('Send return reminders for items due tomorrow');

Schedule::command('reminders:send-return --days=3')
    ->dailyAt('09:00')
    ->name('send-return-reminders-3-days')
    ->description('Send return reminders for items due in 3 days');

// Schedule overdue notifications (runs multiple times per day to catch due dates)
Schedule::command('reminders:send-overdue')
    ->dailyAt('08:00')
    ->name('send-overdue-notifications-morning')
    ->description('Send overdue notifications for items not returned on time (morning check)');

Schedule::command('reminders:send-overdue')
    ->dailyAt('14:00')
    ->name('send-overdue-notifications-afternoon')
    ->description('Send overdue notifications for items not returned on time (afternoon check)');

Schedule::command('reminders:send-overdue')
    ->dailyAt('18:00')
    ->name('send-overdue-notifications-evening')
    ->description('Send overdue notifications for items not returned on time (evening check)');

