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
        'features',
    ];

    protected function casts(): array
    {
        return [
            'max_barberias' => 'integer',
            'max_barberos'  => 'integer',
            'price'         => 'decimal:2',
            'is_custom'     => 'boolean',
            'active'        => 'boolean',
            'features'      => 'array',
        ];
    }

    /**
     * `features` es una excepción puntual a la regla "el plan no gatea vistas" (ver CLAUDE.md).
     * max_barberias/max_barberos limitan CANTIDAD de recursos; el panel consolidado se muestra
     * según datos reales (>1 barbería), no según el plan. `features`, en cambio, gatea si una
     * sección existe o no para el owner, porque corresponde a un feature comercial explícito
     * del catálogo de planes (ej. "ranking_barberos"). No generalizar este mecanismo a otras
     * vistas salvo que el negocio lo defina explícitamente como feature de plan.
     */
    public function hasFeature(string $key): bool
    {
        return (bool) ($this->features[$key] ?? false);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}
