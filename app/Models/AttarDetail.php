<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AttarDetail extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'attar_id',
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

    public function attar()
    {
        return $this->belongsTo(Attar::class);
    }
}
