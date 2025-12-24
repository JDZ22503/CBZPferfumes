<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attar extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'price',
        'cost_price',
        'hsn_code',
        'image_path',
        'is_active',
    ];

    protected $appends = ['stock_quantity'];

    protected $with = ['stock'];

    protected $casts = [
        'price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function stock()
    {
        return $this->morphOne(Stock::class, 'stockable');
    }

    protected $stockQuantityInput = null;

    protected static function booted()
    {
        static::saved(function ($model) {
            if ($model->stockQuantityInput !== null) {
                if ($model->stock) {
                    $model->stock->update(['quantity' => $model->stockQuantityInput]);
                } else {
                    $model->stock()->create(['quantity' => $model->stockQuantityInput]);
                }
                $model->stockQuantityInput = null;
            }
        });
    }

    public function getStockQuantityAttribute()
    {
        return $this->stock ? $this->stock->quantity : 0;
    }

    public function setStockQuantityAttribute($value)
    {
        $this->stockQuantityInput = $value;
    }
}
