<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductSetDetail extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_set_id',
        'description',
        'top_notes',
        'heart_notes',
        'base_notes',
        'images',
        'is_active',
        'is_featured',
    ];

    protected $casts = [
        'images' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function productSet()
    {
        return $this->belongsTo(ProductSet::class);
    }
}
