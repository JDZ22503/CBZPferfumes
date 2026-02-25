<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\OrderMessage;
use App\Models\Transaction;

class Order extends Model
{
    protected $fillable = [
        'party_id',
        'order_date',
        'order_number',
        'total_amount',
        'paid_amount',
        'due_amount',
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

    public function transactions()
    {
        return $this->hasMany(Transaction::class)->latest();
    }
}
