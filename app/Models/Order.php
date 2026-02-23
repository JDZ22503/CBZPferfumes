<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\OrderMessage;

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
        'bill_details',
    ];

    protected $casts = [
        'bill_details' => 'array',
        'order_date' => 'date',
    ];

    public function party()
    {
        return $this->belongsTo(Party::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function messages()
    {
        return $this->hasMany(OrderMessage::class)->latest();
    }
}
