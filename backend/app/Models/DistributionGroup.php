<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DistributionGroup extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'group_name',
        'group_type',
        'list_type',
        'visibility',
        'created_by',
        'auto_membership',
        'department',
        'description',
        'is_active',
        'deleted_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'auto_membership' => 'boolean',
    ];

    // Relationships
    public function teachers()
    {
        return $this->belongsToMany(Teacher::class, 'distribution_group_members', 'group_id', 'teacher_id')
                    ->withTimestamps();
    }

    public function creator()
    {
        return $this->belongsTo(Teacher::class, 'created_by');
    }

    public function deletedBy()
    {
        return $this->belongsTo(Teacher::class, 'deleted_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('group_type', $type);
    }

    public function scopeSystem($query)
    {
        return $query->where('list_type', 'system');
    }

    public function scopeUserCreated($query)
    {
        return $query->where('list_type', 'user');
    }

    public function scopeByDepartment($query, $department)
    {
        return $query->where('department', $department);
    }

    public function scopeVisible($query, $teacherId = null)
    {
        return $query->where(function($q) use ($teacherId) {
            $q->where('visibility', 'shared')
              ->orWhere(function($subQ) use ($teacherId) {
                  if ($teacherId) {
                      $subQ->where('visibility', 'private')
                           ->where('created_by', $teacherId);
                  }
              });
        });
    }
}
