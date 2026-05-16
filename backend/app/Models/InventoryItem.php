<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItem extends Model
{
    use HasFactory, SoftDeletes;

    // Explicitly defining the table name since Laravel might guess "inventory_items"
    protected $table = 'inventory_items';

    protected $fillable = [
        'category_id',
        'item_name',
        'serial_number',
        'property_number',
        'unit',
        'description',
        'item_image',
        'condition',
        'status',
        'date_acquired',
        'unit_price',
        'source_of_fund',
        'remarks',
        'lifespan_years',
        'location',
        'custom_attributes',
        'deleted_by'
    ];

    protected $casts = [
        'date_acquired' => 'date',
        'lifespan_years' => 'integer',
        'unit_price' => 'decimal:2',
        'custom_attributes' => 'array', // This handles JSON encoding/decoding automatically!
    ];

    protected $appends = ['is_approaching_end_of_life', 'end_of_life_date'];

    public function getEndOfLifeDateAttribute()
    {
        if (!$this->date_acquired || !$this->lifespan_years) {
            return null;
        }
        return $this->date_acquired->copy()->addYears($this->lifespan_years);
    }

    public function getIsApproachingEndOfLifeAttribute()
    {
        $eolDate = $this->end_of_life_date;
        if (!$eolDate) {
            return false;
        }
        // Flag if within 6 months (180 days) of EOL
        return now()->diffInDays($eolDate, false) <= 180;
    }


    public function category()
    {
        return $this->belongsTo(ItemCategory::class, 'category_id');
    }

    public function borrowRequests()
    {
        return $this->belongsToMany(BorrowRequest::class, 'borrow_request_items');
    }

    public function distributions()
    {
        return $this->belongsToMany(ItemDistribution::class, 'item_distribution_items')
                    ->withPivot('status', 'returned_at')
                    ->withTimestamps();
    }
}
