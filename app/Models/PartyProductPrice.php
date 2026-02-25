<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartyProductPrice extends Model
{
    protected $fillable = [
        'party_id',
        'product_id',
        'product_set_id',
        'attar_id',
        'price',
    ];

    public function party()
    {
        return $this->belongsTo(Party::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function productSet()
    {
        return $this->belongsTo(ProductSet::class);
    }

    public function attar()
    {
        return $this->belongsTo(Attar::class);
    }
}
