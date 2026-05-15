<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Club extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'advisor_teacher_id',
        'category',
        'meeting_schedule',
        'meeting_location',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function advisorTeacher()
    {
        return $this->belongsTo(Teacher::class, 'advisor_teacher_id');
    }

    public function distributions()
    {
        return $this->morphMany(ItemDistribution::class, 'assignable');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByAdvisor($query, $teacherId)
    {
        return $query->where('advisor_teacher_id', $teacherId);
    }

    // Accessors
    public function getFullNameAttribute()
    {
        return $this->code ? "{$this->name} ({$this->code})" : $this->name;
    }
}
