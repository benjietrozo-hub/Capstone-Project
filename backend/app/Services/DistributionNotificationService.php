<?php

namespace App\Services;

use App\Models\Teacher;
use App\Models\DistributionGroup;
use App\Models\BulkDistribution;
use App\Models\ItemDistribution;
use App\Jobs\SendDistributionNotification;
use Illuminate\Support\Facades\Log;

class DistributionNotificationService
{
    /**
     * Send notification for bulk distribution creation
     */
    public function notifyBulkDistributionCreated(BulkDistribution $bulkDistribution, int $senderId = null): void
    {
        try {
            $group = $bulkDistribution->group()->with('teachers')->first();
            $item = $bulkDistribution->item;

            if (!$group || !$item) {
                Log::warning("Cannot send notification: group or item not found for bulk distribution {$bulkDistribution->id}");
                return;
            }

            $data = [
                'bulk_distribution_id' => $bulkDistribution->id,
                'item_name' => $item->item_name,
                'item_code' => $item->item_code,
                'quantity' => $bulkDistribution->quantity_per_member,
                'group_name' => $group->group_name,
                'distribution_date' => $bulkDistribution->distribution_date->format('Y-m-d'),
                'expected_return_date' => $bulkDistribution->expected_return_date?->format('Y-m-d'),
            ];

            // Send to all teachers in the group
            foreach ($group->teachers as $teacher) {
                SendDistributionNotification::dispatch(
                    $teacher,
                    'bulk_distributed',
                    $data,
                    $senderId
                );
            }

            Log::info("Bulk distribution notifications queued for group {$group->group_name}");
        } catch (\Exception $e) {
            Log::error("Failed to send bulk distribution notifications: " . $e->getMessage());
        }
    }

    /**
     * Send notification for bulk distribution processed
     */
    public function notifyBulkDistributionProcessed(BulkDistribution $bulkDistribution, int $senderId = null): void
    {
        try {
            $group = $bulkDistribution->group()->with('teachers')->first();
            $item = $bulkDistribution->item;

            if (!$group || !$item) {
                Log::warning("Cannot send notification: group or item not found for bulk distribution {$bulkDistribution->id}");
                return;
            }

            $data = [
                'bulk_distribution_id' => $bulkDistribution->id,
                'item_name' => $item->item_name,
                'item_code' => $item->item_code,
                'quantity' => $bulkDistribution->quantity_per_member,
                'group_name' => $group->group_name,
                'processed_date' => now()->format('Y-m-d'),
            ];

            // Send to all teachers in the group
            foreach ($group->teachers as $teacher) {
                SendDistributionNotification::dispatch(
                    $teacher,
                    'bulk_distribution_processed',
                    $data,
                    $senderId
                );
            }

            Log::info("Bulk distribution processed notifications queued for group {$group->group_name}");
        } catch (\Exception $e) {
            Log::error("Failed to send bulk distribution processed notifications: " . $e->getMessage());
        }
    }

    /**
     * Send notification for item distribution
     */
    public function notifyItemDistributed(ItemDistribution $itemDistribution, int $senderId = null): void
    {
        try {
            $teacher = $itemDistribution->teacher;
            $item = $itemDistribution->item;

            if (!$teacher || !$item) {
                Log::warning("Cannot send notification: teacher or item not found for item distribution {$itemDistribution->id}");
                return;
            }

            $data = [
                'item_distribution_id' => $itemDistribution->id,
                'item_name' => $item->item_name,
                'item_code' => $item->item_code,
                'quantity' => $itemDistribution->quantity_distributed,
                'distribution_date' => $itemDistribution->distribution_date->format('Y-m-d'),
                'expected_return_date' => $itemDistribution->expected_return_date?->format('Y-m-d'),
            ];

            SendDistributionNotification::dispatch(
                $teacher,
                'item_distributed',
                $data,
                $senderId
            );

            Log::info("Item distribution notification queued for teacher {$teacher->full_name}");
        } catch (\Exception $e) {
            Log::error("Failed to send item distribution notification: " . $e->getMessage());
        }
    }

    /**
     * Send notification for distribution cancellation
     */
    public function notifyDistributionCancelled(ItemDistribution $itemDistribution, int $senderId = null): void
    {
        try {
            $teacher = $itemDistribution->teacher;
            $item = $itemDistribution->item;

            if (!$teacher || !$item) {
                Log::warning("Cannot send notification: teacher or item not found for item distribution {$itemDistribution->id}");
                return;
            }

            $data = [
                'item_distribution_id' => $itemDistribution->id,
                'item_name' => $item->item_name,
                'item_code' => $item->item_code,
                'quantity' => $itemDistribution->quantity_distributed,
                'cancelled_date' => now()->format('Y-m-d'),
            ];

            SendDistributionNotification::dispatch(
                $teacher,
                'distribution_cancelled',
                $data,
                $senderId
            );

            Log::info("Distribution cancellation notification queued for teacher {$teacher->full_name}");
        } catch (\Exception $e) {
            Log::error("Failed to send distribution cancellation notification: " . $e->getMessage());
        }
    }

    /**
     * Send return reminder notifications
     */
    public function sendReturnReminders(): void
    {
        try {
            // Get active distributions that are due soon or overdue
            $dueSoon = ItemDistribution::active()
                ->whereNotNull('expected_return_date')
                ->where('expected_return_date', '<=', now()->addDays(3))
                ->where('expected_return_date', '>', now())
                ->with(['teacher', 'item'])
                ->get();

            $overdue = ItemDistribution::active()
                ->whereNotNull('expected_return_date')
                ->where('expected_return_date', '<', now())
                ->with(['teacher', 'item'])
                ->get();

            // Send due soon reminders
            foreach ($dueSoon as $distribution) {
                $daysUntilDue = now()->diffInDays($distribution->expected_return_date);
                
                $data = [
                    'item_distribution_id' => $distribution->id,
                    'item_name' => $distribution->item->item_name,
                    'item_code' => $distribution->item->item_code,
                    'quantity' => $distribution->quantity_distributed,
                    'expected_return_date' => $distribution->expected_return_date->format('Y-m-d'),
                    'days_until_due' => $daysUntilDue,
                ];

                SendDistributionNotification::dispatch(
                    $distribution->teacher,
                    'distribution_due_soon',
                    $data
                );
            }

            // Send overdue notifications
            foreach ($overdue as $distribution) {
                $daysOverdue = now()->diffInDays($distribution->expected_return_date);
                
                $data = [
                    'item_distribution_id' => $distribution->id,
                    'item_name' => $distribution->item->item_name,
                    'item_code' => $distribution->item->item_code,
                    'quantity' => $distribution->quantity_distributed,
                    'expected_return_date' => $distribution->expected_return_date->format('Y-m-d'),
                    'days_overdue' => $daysOverdue,
                ];

                SendDistributionNotification::dispatch(
                    $distribution->teacher,
                    'distribution_overdue',
                    $data
                );
            }

            Log::info("Return reminder notifications queued: {$dueSoon->count()} due soon, {$overdue->count()} overdue");
        } catch (\Exception $e) {
            Log::error("Failed to send return reminders: " . $e->getMessage());
        }
    }

    /**
     * Send notification to specific teacher
     */
    public function notifyTeacher(Teacher $teacher, string $type, array $data, int $senderId = null): void
    {
        try {
            SendDistributionNotification::dispatch(
                $teacher,
                $type,
                $data,
                $senderId
            );

            Log::info("Notification queued for teacher {$teacher->full_name} with type: {$type}");
        } catch (\Exception $e) {
            Log::error("Failed to queue notification for teacher {$teacher->full_name}: " . $e->getMessage());
        }
    }
}
