<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ItemDistribution extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'item_id',
        'teacher_id',
        'distributed_by',
        'bulk_distribution_id',
        'quantity_distributed',
        'status',
        'distribution_date',
        'expected_return_date',
        'actual_return_date',
        'purpose',
        'notes',
        'admin_notes',
        'condition_on_distribution',
        'condition_on_return',
    ];

    protected $casts = [
        'distribution_date' => 'date',
        'expected_return_date' => 'date',
        'actual_return_date' => 'date',
        'quantity_distributed' => 'integer',
    ];

    protected $appends = ['is_overdue'];

    // Relationships
    public function category()
    {
        return $this->belongsTo(ItemCategory::class, 'category_id');
    }

    public function inventoryItems()
    {
        return $this->belongsToMany(InventoryItem::class, 'item_distribution_items')
                    ->withPivot('status', 'returned_at')
                    ->withTimestamps();
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function distributedBy()
    {
        return $this->belongsTo(Admin::class, 'distributed_by');
    }

    public function bulkDistribution()
    {
        return $this->belongsTo(BulkDistribution::class, 'bulk_distribution_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeReturned($query)
    {
        return $query->where('status', 'returned');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'active')
                    ->whereNotNull('expected_return_date')
                    ->where('expected_return_date', '<', now());
    }

    // Accessors
    public function getIsOverdueAttribute()
    {
        return $this->status === 'active' && 
               $this->expected_return_date && 
               $this->expected_return_date->isPast();
    }

    public function getDaysOverdueAttribute()
    {
        if (!$this->is_overdue) {
            return 0;
        }
        return now()->diffInDays($this->expected_return_date);
    }
}
