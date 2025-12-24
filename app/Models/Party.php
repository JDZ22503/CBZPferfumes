<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Party extends Model
{
    protected $fillable = [
        'name',
        'type',
        'phone',
        'email',
        'address',
        'balance',
        'image_path',
        'gst_no',
    ];
    
    public function productPrices()
    {
        return $this->hasMany(PartyProductPrice::class);
    }
}
