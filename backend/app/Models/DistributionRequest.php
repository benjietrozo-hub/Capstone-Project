<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DistributionRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'teacher_id',
        'item_id',
        'category_id',
        'quantity_requested',
        'reason',
        'notes',
        'status',
        'reviewed_by',
        'admin_notes',
        'reviewed_at',
        'distribution_id',
        // New fields for entity requests
        'requested_for_type',
        'requested_for_id',
        'requested_by',
        'priority',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
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

    // Legacy relationship - kept for backward compatibility
    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'item_id');
    }

    public function reviewedBy()
    {
        return $this->belongsTo(Admin::class, 'reviewed_by');
    }

    public function distribution()
    {
        return $this->belongsTo(ItemDistribution::class, 'distribution_id');
    }

    // Polymorphic relationship - the entity this request is for
    public function requestedFor()
    {
        return $this->morphTo('requested_for', 'requested_for_type', 'requested_for_id');
    }

    // Teacher who made the request
    public function requestedByTeacher()
    {
        return $this->belongsTo(Teacher::class, 'requested_by');
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

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeDistributed($query)
    {
        return $query->where('status', 'distributed');
    }
}
