<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Classroom extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'room_number',
        'building',
        'floor',
        'capacity',
        'room_type',
        'assigned_teacher_id',
        'department_id',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'capacity' => 'integer',
    ];

    // Relationships
    public function assignedTeacher()
    {
        return $this->belongsTo(Teacher::class, 'assigned_teacher_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
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

    public function scopeByDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    public function scopeByTeacher($query, $teacherId)
    {
        return $query->where('assigned_teacher_id', $teacherId);
    }

    // Accessors
    public function getFullNameAttribute()
    {
        $name = $this->room_number;
        if ($this->building) {
            $name .= " - {$this->building}";
        }
        if ($this->room_type) {
            $name .= " ({$this->room_type})";
        }
        return $name;
    }
}
