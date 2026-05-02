<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BorrowRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'request_code',
        'teacher_id',
        'category_id',
        'quantity_requested',
        'purpose',
        'date_requested',
        'date_needed',
        'expected_return_date',
        'status',
        'admin_notes',
        'approved_by',
        'issued_by',
        'received_by',
    ];

    protected $casts = [
        'date_requested' => 'date:Y-m-d',
        'date_needed' => 'date:Y-m-d',
        'expected_return_date' => 'date:Y-m-d',
        'quantity_requested' => 'integer',
    ];

    // Relationships
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function category()
    {
        return $this->belongsTo(ItemCategory::class, 'category_id');
    }

    public function inventoryItems()
    {
        return $this->belongsToMany(InventoryItem::class, 'borrow_request_items')
                    ->withPivot('status', 'returned_at')
                    ->withTimestamps();
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeBorrowed($query)
    {
        return $query->where('status', 'borrowed');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'borrowed')
                    ->where('expected_return_date', '<', now());
    }

    // Accessors
    public function getIsOverdueAttribute()
    {
        return $this->status === 'borrowed' && 
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

    public function deletedByAdmin()
    {
        return $this->belongsTo(Admin::class, 'deleted_by');
    }
}
