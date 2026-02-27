<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Stock;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'sku',
        'price',
        'cost_price',
        'image_path',
        'is_active',
        'hsn_code',
    ];

    protected $with = ['stock'];
    protected $appends = ['stock_quantity'];

    public function stock()
    {
        return $this->morphOne(Stock::class, 'stockable');
    }

    public function productDetail()
    {
        return $this->hasOne(ProductDetail::class);
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

    public function getImagePathAttribute($value)
    {
        if (!$value) return null;
        return '/' . ltrim($value, '/');
    }
}
