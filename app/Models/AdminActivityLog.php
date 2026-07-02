<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminActivityLog extends Model
{
    protected $fillable = [
        'admin_id',
        'action',
        'target_owner_id',
        'detalle',
    ];

    protected function casts(): array
    {
        return [
            'detalle' => 'array',
        ];
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function targetOwner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'target_owner_id');
    }
}
