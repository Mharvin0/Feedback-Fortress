<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InboxMessage extends Model
{
    protected $fillable = [
        'user_id',
        'subject',
        'content',
        'is_read',
        'is_pinned',
    ];
}
