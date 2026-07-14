<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemJobRun extends Model
{
    protected $fillable = [
        'job_name',
        'started_at',
        'finished_at',
        'status',
        'summary',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'started_at'  => 'datetime',
            'finished_at' => 'datetime',
        ];
    }
}
