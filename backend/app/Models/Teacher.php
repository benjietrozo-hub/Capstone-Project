<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Teacher extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'teacher_id',
        'username',
        'email',
        'password',
        'first_name',
        'middle_initial',
        'last_name',
        'department',
        'phone',
        'profile_image',
        'status',
        'last_login',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login' => 'datetime',
        'password' => 'hashed',
    ];

    protected $appends = ['full_name'];

    // Relationships
    public function borrowRequests()
    {
        return $this->hasMany(BorrowRequest::class);
    }

    public function activeBorrows()
    {
        return $this->hasMany(BorrowRequest::class)
                    ->whereIn('status', ['approved', 'borrowed']);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function distributionGroups()
    {
        return $this->belongsToMany(DistributionGroup::class, 'distribution_group_members', 'teacher_id', 'group_id')
                    ->withTimestamps();
    }

    public function createdDistributionGroups()
    {
        return $this->hasMany(DistributionGroup::class, 'created_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByDepartment($query, $department)
    {
        return $query->where('department', $department);
    }

    // Accessors
    public function getFullNameAttribute()
    {
        $name = $this->first_name;
        if ($this->middle_initial) {
            $name .= ' ' . $this->middle_initial;
        }
        if ($this->last_name) {
            $name .= ' ' . $this->last_name;
        }
        return $name;
    }
}
