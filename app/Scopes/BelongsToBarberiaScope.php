<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * Global Scope para aislar datos por barbería (multi-tenancy lógico).
 *
 * Se aplicará en fases futuras a los modelos que cuelgan de barberia_id:
 * Servicio, MedioPago, Cliente, Corte, Gasto y GastoRegistro.
 *
 * Lógica prevista:
 *   - role=barber  → filtra por $user->barberia_id (ve solo su barbería)
 *   - role=owner   → filtra por barberias.owner_id = $user->id (ve todas sus barberías)
 *   - role=admin   → sin filtro (acceso global de soporte)
 *
 * Para activarlo en un modelo cuando llegue su fase, agregar en el booted():
 *
 *   protected static function booted(): void
 *   {
 *       static::addGlobalScope(new BelongsToBarberiaScope);
 *   }
 */
class BelongsToBarberiaScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        // Implementación diferida a la fase de cada modelo.
    }
}
