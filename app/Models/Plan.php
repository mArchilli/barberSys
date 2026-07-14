<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory;

    /**
     * Catálogo de feature flags conocidos que puede tener `features` (json).
     * Para sumar un flag nuevo: agregar una entrada acá (key => label legible).
     * El formulario de Admin/Planes lee este array para renderizar los
     * checkboxes — no requiere tocar la vista.
     */
    public const KNOWN_FEATURES = [
        'ranking_barberos' => 'Ranking de barberos',
    ];

    /**
     * `included_items` es puramente descriptivo (texto de marketing para
     * mostrarle al owner qué trae el plan) y NUNCA gatea funcionalidad —
     * para eso existe `features`. Si un ítem de esta lista menciona algo
     * controlado por un feature flag (ej. "ranking de productividad" ↔
     * `ranking_barberos`), quien edite el catálogo debe activar también
     * ese flag en `features`, o el plan promete algo que no cumple.
     */

    /**
     * Grandfathering de precio: cambiar `price` acá NUNCA debe recalcular ni
     * afectar suscripciones ya existentes — solo aplica a suscripciones
     * nuevas a partir de este momento. Hoy no hay billing real integrado,
     * así que esto no requiere código adicional; pero cuando se integre
     * MercadoPago, el precio de catálogo NO debe usarse para modificar
     * preapprovals ya autorizados de owners existentes, solo para altas
     * nuevas. Ver regla completa en CLAUDE.md.
     */
    protected $fillable = [
        'name',
        'slug',
        'max_barberias',
        'max_barberos',
        'price',
        'is_custom',
        'active',
        'features',
        'included_items',
    ];

    protected function casts(): array
    {
        return [
            'max_barberias'   => 'integer',
            'max_barberos'    => 'integer',
            'price'           => 'decimal:2',
            'is_custom'       => 'boolean',
            'active'          => 'boolean',
            'features'        => 'array',
            'included_items'  => 'array',
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
