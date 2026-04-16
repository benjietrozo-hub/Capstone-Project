<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Report extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'teacher_id',
        'item_id',
        'report_type',
        'description',
        'status',
        'admin_response',
        'admin_id',
        'resolved_at',
        'resolved_by',
        'date_reported',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'date_reported' => 'datetime',
    ];

    // Relationships
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function item()
    {
        return $this->belongsTo(ToolEquipment::class);
    }

    public function assignedAdmin()
    {
        return $this->belongsTo(Admin::class, 'assigned_to');
    }

    // Scopes
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeByTeacher($query, $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeAssignedTo($query, $adminId)
    {
        return $query->where('assigned_to', $adminId);
    }
}
