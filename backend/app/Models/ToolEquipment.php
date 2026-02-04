<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ToolEquipment extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tools_equipment';

    protected $fillable = [
        'item_code',
        'item_name',
        'description',
        'category',
        'quantity_total',
        'quantity_available',
        'quantity_borrowed',
        'condition_status', // Actual column name
        'location',
        'unit_price',
        'image',
        'acquisition_date',
        'purchase_date', // Legacy column
        'supplier', // Legacy column
        'notes',
        'status',
    ];

    // Map condition to condition_status for backward compatibility
    public function getConditionAttribute()
    {
        return $this->attributes['condition_status'] ?? null;
    }
    
    public function setConditionAttribute($value)
    {
        $this->attributes['condition_status'] = $value;
    }

    protected $casts = [
        'acquisition_date' => 'date',
        'unit_price' => 'decimal:2',
        'quantity_total' => 'integer',
        'quantity_available' => 'integer',
        'quantity_borrowed' => 'integer',
    ];

    protected $appends = ['condition']; // Add condition to JSON output

    // Relationships
    public function borrowRequests()
    {
        return $this->hasMany(BorrowRequest::class, 'item_id');
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class, 'item_id');
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('status', 'active')
                    ->where('quantity_available', '>', 0);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    // Accessors & Mutators
    public function getIsAvailableAttribute()
    {
        return $this->quantity_available > 0 && $this->status === 'active';
    }

    // Methods
    public function updateQuantities()
    {
        $this->quantity_borrowed = $this->borrowRequests()
            ->whereIn('status', ['approved', 'borrowed'])
            ->sum('quantity_requested');
        
        $this->quantity_available = $this->quantity_total - $this->quantity_borrowed;
        $this->save();
    }
}
