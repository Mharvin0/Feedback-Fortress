<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Database\Eloquent\SoftDeletes;

class Grievance extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'grievance_id',
        'user_id',
        'subject',
        'type',
        'priority',
        'details',
        'status',
        'attachments',
        'resolution_message',
        'resolved_at',
        'draft_saved_at'
    ];

    protected $casts = [
        'attachments' => 'array',
        'resolved_at' => 'datetime'
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

    // Encrypt subject before saving
    public function setSubjectAttribute($value)
    {
        $this->attributes['subject'] = Crypt::encryptString($value);
    }

    // Decrypt subject when retrieving
    public function getSubjectAttribute($value)
    {
        try {
            return Crypt::decryptString($value);
        } catch (\Exception $e) {
            return $value; // Return as plain text if not encrypted
        }
    }

    // Encrypt details before saving
    public function setDetailsAttribute($value)
    {
        $this->attributes['details'] = Crypt::encryptString($value);
    }

    // Decrypt details when retrieving
    public function getDetailsAttribute($value)
    {
        try {
            return Crypt::decryptString($value);
        } catch (\Exception $e) {
            return $value;
        }
    }

    public function markAsResolved(string $resolutionMessage): void
    {
        $this->status = 'resolved';
        $this->resolution_message = $resolutionMessage;
        $this->resolved_at = now();
        $this->save();

        // Notify the user that their grievance has been resolved
        // $this->user->notify(new GrievanceResolved($this, $resolutionMessage));
    }
} 