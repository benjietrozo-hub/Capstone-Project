<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'po_number',
        'po_date',
        'expected_delivery_date',
        'status',
        'company_name',
        'company_address',
        'company_contact_person',
        'company_email',
        'company_phone',
        'supplier_id',
        'supplier_name',
        'supplier_address',
        'supplier_contact_person',
        'supplier_email',
        'supplier_phone',
        'subtotal',
        'discount',
        'tax',
        'shipping_fee',
        'total_amount',
        'delivery_address',
        'delivery_method',
        'shipping_terms',
        'receiving_instructions',
        'payment_method',
        'payment_terms',
        'reference',
        'requested_by',
        'approved_by',
        'approval_date',
        'notes',
        'terms_conditions',
        'admin_id',
        'deleted_by'
    ];

    protected $casts = [
        'po_date' => 'date',
        'expected_delivery_date' => 'date',
        'approval_date' => 'datetime',
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }

    public function logs()
    {
        return $this->hasMany(SystemLog::class, 'reference_id')->where('log_type', 'purchase_order');
    }

    public function deletedByAdmin()
    {
        return $this->belongsTo(Admin::class, 'deleted_by');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($po) {
            if (empty($po->po_number)) {
                $po->po_number = self::generatePONumber();
            }
        });
    }

    public static function generatePONumber()
    {
        $year = date('Y');
        $month = date('m');
        $prefix = "PO-{$year}{$month}-";
        
        $lastPO = self::where('po_number', 'like', $prefix . '%')
            ->orderBy('po_number', 'desc')
            ->first();

        if ($lastPO) {
            $lastNumber = intval(substr($lastPO->po_number, -4));
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return $prefix . $newNumber;
    }
}
