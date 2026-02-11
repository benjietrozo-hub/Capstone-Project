<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'supplier_code',
        'name',
        'address',
        'contact_person',
        'email',
        'phone',
        'tax_id',
        'payment_terms',
        'notes',
        'status',
        'deleted_by'
    ];

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    public function deletedByAdmin()
    {
        return $this->belongsTo(Admin::class, 'deleted_by');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($supplier) {
            if (empty($supplier->supplier_code)) {
                $supplier->supplier_code = self::generateSupplierCode();
            }
        });
    }

    public static function generateSupplierCode()
    {
        $prefix = "SUP-";
        
        $lastSupplier = self::where('supplier_code', 'like', $prefix . '%')
            ->orderBy('supplier_code', 'desc')
            ->first();

        if ($lastSupplier) {
            $lastNumber = intval(substr($lastSupplier->supplier_code, -4));
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return $prefix . $newNumber;
    }
}
