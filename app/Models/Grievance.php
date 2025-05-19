<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Grievance extends Model
{
    use HasFactory;

    protected $fillable = [
        'grievance_id',
        'user_id',
        'subject',
        'type',
        'details',
        'status',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($grievance) {
            $grievance->grievance_id = 'GRV-' . strtoupper(Str::random(8));
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
} 