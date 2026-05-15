<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_distribution_id',
        'from_assignable_type',
        'from_assignable_id',
        'to_assignable_type',
        'to_assignable_id',
        'transfer_reason',
        'rejection_reason',
        'requested_by_type',
        'requested_by_id',
        'approved_by',
        'approved_at',
        'status',
        'transfer_date',
        'completed_at',
        'notes',
    ];

    protected $casts = [
        'transfer_date' => 'date',
        'completed_at'  => 'datetime',
        'approved_at'   => 'datetime',
    ];

    // Relationships
    public function itemDistribution()
    {
        return $this->belongsTo(ItemDistribution::class);
    }

    public function fromAssignable()
    {
        return $this->morphTo('from_assignable', 'from_assignable_type', 'from_assignable_id');
    }

    public function toAssignable()
    {
        return $this->morphTo('to_assignable', 'to_assignable_type', 'to_assignable_id');
    }

    public function requestedBy()
    {
        return $this->morphTo('requested_by', 'requested_by_type', 'requested_by_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(Admin::class, 'approved_by');
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

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}
