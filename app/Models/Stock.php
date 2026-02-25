<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Stock extends Model
{
    protected $fillable = [
        'stockable_id',
        'stockable_type',
        'quantity',
    ];

    public function stockable(): MorphTo
    {
        return $this->morphTo();
    }
}
