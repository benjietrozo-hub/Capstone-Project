<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BulkDistribution extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'group_id',
        'item_id',
        'distributed_by',
        'total_quantity',
        'quantity_per_member',
        'status',
        'purpose',
        'notes',
        'distribution_date',
        'expected_return_date',
    ];

    protected $casts = [
        'distribution_date' => 'date',
        'expected_return_date' => 'date',
        'total_quantity' => 'integer',
        'quantity_per_member' => 'integer',
    ];

    // Relationships
    public function group()
    {
        return $this->belongsTo(DistributionGroup::class, 'group_id');
    }

    public function item()
    {
        return $this->belongsTo(ToolEquipment::class, 'item_id');
    }

    public function distributedBy()
    {
        return $this->belongsTo(Admin::class, 'distributed_by');
    }

    public function itemDistributions()
    {
        return $this->hasMany(ItemDistribution::class, 'bulk_distribution_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeProcessing($query)
    {
        return $query->where('status', 'processing');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    // Methods
    public function processBulkDistribution()
    {
        if ($this->status !== 'pending') {
            throw new \Exception('Bulk distribution can only be processed from pending status');
        }

        $this->update(['status' => 'processing']);

        $group = $this->group()->with('teachers')->first();
        $item = $this->item;

        if (!$group || !$item) {
            throw new \Exception('Group or item not found');
        }

        // Check if enough quantity is available
        if ($item->quantity_available < $this->total_quantity) {
            throw new \Exception('Insufficient quantity available for bulk distribution');
        }

        // Create individual distributions for each teacher
        foreach ($group->teachers as $teacher) {
            ItemDistribution::create([
                'item_id' => $this->item_id,
                'teacher_id' => $teacher->id,
                'distributed_by' => $this->distributed_by,
                'quantity_distributed' => $this->quantity_per_member,
                'status' => 'active',
                'distribution_date' => $this->distribution_date,
                'expected_return_date' => $this->expected_return_date,
                'purpose' => $this->purpose,
                'notes' => $this->notes,
                'condition_on_distribution' => 'good',
                'bulk_distribution_id' => $this->id,
            ]);
        }

        // Update item quantity
        $item->decrement('quantity_available', $this->total_quantity);

        $this->update(['status' => 'completed']);

        return true;
    }

    public function cancelBulkDistribution()
    {
        if ($this->status === 'completed') {
            throw new \Exception('Cannot cancel completed bulk distribution');
        }

        if ($this->status === 'processing') {
            // Return quantities from individual distributions
            $totalReturned = 0;
            foreach ($this->itemDistributions as $distribution) {
                if ($distribution->status === 'active') {
                    $this->item->increment('quantity_available', $distribution->quantity_distributed);
                    $totalReturned += $distribution->quantity_distributed;
                    $distribution->update(['status' => 'cancelled']);
                }
            }
        }

        $this->update(['status' => 'cancelled']);

        return true;
    }
}
