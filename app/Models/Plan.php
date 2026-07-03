<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'max_barberias',
        'max_barberos',
        'price',
        'is_custom',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'max_barberias' => 'integer',
            'max_barberos'  => 'integer',
            'price'         => 'decimal:2',
            'is_custom'     => 'boolean',
            'active'        => 'boolean',
        ];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}
