<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'order_id',
        'party_id',
        'type',
        'amount',
        'payment_method',
        'payment_status',
        'transaction_date',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function party()
    {
        return $this->belongsTo(Party::class);
    }
}
