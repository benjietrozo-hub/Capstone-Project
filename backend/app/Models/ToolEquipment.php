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
        'deleted_by',
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

    public function deletedByAdmin()
    {
        return $this->belongsTo(Admin::class, 'deleted_by');
    }

    /**
     * Scope for sorting by acquisition year and alphabetically within each year
     */
    public function scopeByYearAndName($query, $yearOrder = 'desc', $nameOrder = 'asc')
    {
        return $query->orderByRaw('YEAR(acquisition_date) ' . strtoupper($yearOrder))
                     ->orderBy('item_name', strtoupper($nameOrder));
    }

    /**
     * Scope for combined sorting (primary + secondary)
     */
    public function scopeCombinedSort($query, $primary = 'acquisition_year', $secondary = 'item_name', $primaryOrder = 'desc', $secondaryOrder = 'asc')
    {
        switch ($primary) {
            case 'acquisition_year':
                return $query->orderByRaw('YEAR(acquisition_date) ' . strtoupper($primaryOrder))
                             ->orderBy('item_name', strtoupper($secondaryOrder));
            case 'item_name':
                return $query->orderBy('item_name', strtoupper($primaryOrder))
                             ->orderByRaw('YEAR(acquisition_date) ' . strtoupper($secondaryOrder));
            case 'acquisition_date':
                return $query->orderBy('acquisition_date', strtoupper($primaryOrder))
                             ->orderBy('item_name', strtoupper($secondaryOrder));
            default:
                return $query->orderBy($primary, strtoupper($primaryOrder))
                             ->orderBy($secondary, strtoupper($secondaryOrder));
        }
    }
}
