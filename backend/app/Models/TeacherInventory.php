<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TeacherInventory extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'teacher_inventory';

    protected $fillable = [
        'teacher_id',
        'parent_category',
        'item_code',
        'item_name',
        'description',
        'category',
        'quantity',
        'condition',
        'location',
        'unit_price',
        'image',
        'acquisition_date',
        'notes',
        'status',
    ];

    protected $casts = [
        'acquisition_date' => 'date',
        'unit_price' => 'decimal:2',
    ];

    // Relationships
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByParentCategory($query, $parentCategory)
    {
        return $query->where('parent_category', $parentCategory);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByTeacher($query, $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }
}
