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
        'item_image',
        'condition',
        'status',
        'date_acquired',
        'custom_attributes',
        'deleted_by'
    ];

    protected $casts = [
        'date_acquired' => 'date',
        'custom_attributes' => 'array', // This handles JSON encoding/decoding automatically!
    ];

    public function category()
    {
        return $this->belongsTo(ItemCategory::class, 'category_id');
    }

    public function borrowRequests()
    {
        return $this->belongsToMany(BorrowRequest::class, 'borrow_request_items');
    }
}
