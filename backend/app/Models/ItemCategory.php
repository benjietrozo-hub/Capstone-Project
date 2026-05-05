<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ItemCategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'parent_category',
        'category_name',
        'description',
        'category_image',
        'deleted_by',
    ];

    protected $appends = ['available_items', 'total_items'];

    public function customFields()
    {
        return $this->hasMany(CustomField::class, 'category_id');
    }

    public function inventoryItems()
    {
        return $this->hasMany(InventoryItem::class, 'category_id');
    }

    public function getAvailableItemsAttribute(): int
    {
        return $this->inventoryItems()->where('status', 'available')->count();
    }

    public function getTotalItemsAttribute(): int
    {
        return $this->inventoryItems()->count();
    }
}
