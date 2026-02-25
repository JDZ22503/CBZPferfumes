<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderMessage extends Model
{
    protected $fillable = ['order_id', 'message'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
