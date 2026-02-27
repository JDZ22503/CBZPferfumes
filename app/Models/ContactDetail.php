<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactDetail extends Model
{
    protected $fillable = ['email', 'phone', 'address', 'instagram_link', 'whatsapp_link', 'facebook_link'];
}
