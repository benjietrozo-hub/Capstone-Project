<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class DistributionLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'distributable_type',
        'distributable_id',
        'teacher_id',
        'item_id',
        'quantity',
        'action',
        'description',
        'old_values',
        'new_values',
        'performed_by',
        'performed_by_type',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    // Relationships
    public function distributable(): MorphTo
    {
        return $this->morphTo();
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function item()
    {
        return $this->belongsTo(ToolEquipment::class);
    }

    public function performedBy()
    {
        if ($this->performed_by_type === 'admin') {
            return $this->belongsTo(Admin::class, 'performed_by');
        }
        return $this->belongsTo(Teacher::class, 'performed_by');
    }

    // Scopes
    public function scopeAction($query, $action)
    {
        return $query->where('action', $action);
    }

    public function scopeForTeacher($query, $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    public function scopeForItem($query, $itemId)
    {
        return $query->where('item_id', $itemId);
    }

    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    // Methods
    public static function logBulkDistribution($bulkDistribution, $action, $performedBy, $performedByType, $description = null)
    {
        return self::create([
            'distributable_type' => BulkDistribution::class,
            'distributable_id' => $bulkDistribution->id,
            'teacher_id' => null, // Bulk distribution affects multiple teachers
            'item_id' => $bulkDistribution->item_id,
            'quantity' => $bulkDistribution->total_quantity,
            'action' => $action,
            'description' => $description,
            'old_values' => $action === 'modified' ? $bulkDistribution->getOriginal() : null,
            'new_values' => $bulkDistribution->toArray(),
            'performed_by' => $performedBy,
            'performed_by_type' => $performedByType,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    public static function logItemDistribution($itemDistribution, $action, $performedBy, $performedByType, $description = null)
    {
        return self::create([
            'distributable_type' => ItemDistribution::class,
            'distributable_id' => $itemDistribution->id,
            'teacher_id' => $itemDistribution->teacher_id,
            'item_id' => $itemDistribution->item_id,
            'quantity' => $itemDistribution->quantity_distributed,
            'action' => $action,
            'description' => $description,
            'old_values' => $action === 'modified' ? $itemDistribution->getOriginal() : null,
            'new_values' => $itemDistribution->toArray(),
            'performed_by' => $performedBy,
            'performed_by_type' => $performedByType,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
