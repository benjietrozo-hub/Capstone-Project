<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemConditionLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'item_distribution_id',
        'reported_by_type',
        'reported_by_id',
        'log_type',
        'condition_before',
        'condition_after',
        'description',
        'notes',
        'cost',
        'repair_cost',
        'repair_date',
        'disposal_reason',
        'disposal_date',
        'logged_at',
        'metadata',
        'images',
    ];

    protected $casts = [
        'repair_cost'  => 'decimal:2',
        'cost'         => 'decimal:2',
        'repair_date'  => 'date',
        'disposal_date'=> 'date',
        'logged_at'    => 'datetime',
        'images'       => 'array',
        'metadata'     => 'array',
    ];

    // Relationships
    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'item_id');
    }

    public function itemDistribution()
    {
        return $this->belongsTo(ItemDistribution::class);
    }

    public function reportedBy()
    {
        return $this->morphTo('reported_by', 'reported_by_type', 'reported_by_id');
    }

    // Scopes
    public function scopeDamage($query)
    {
        return $query->where('log_type', 'damage');
    }

    public function scopeRepair($query)
    {
        return $query->where('log_type', 'repair');
    }

    public function scopeDisposal($query)
    {
        return $query->where('log_type', 'disposal');
    }

    public function scopeInspection($query)
    {
        return $query->where('log_type', 'inspection');
    }

    public function scopeForItem($query, $itemId)
    {
        return $query->where('item_id', $itemId);
    }
}
