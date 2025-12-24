<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'party_id',
        'order_date',
        'order_number',
        'total_amount',
        'status',
        'type',
        'payment_status',
        'message',
    ];

    public function party()
    {
        return $this->belongsTo(Party::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
