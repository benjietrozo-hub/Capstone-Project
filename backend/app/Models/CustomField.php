<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomField extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'field_name',
        'field_type',
        'is_required',
    ];

    protected $casts = [
        'is_required' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(ItemCategory::class, 'category_id');
    }
}
