<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

/**
 * Global Scope para aislar datos por barbería (multi-tenancy lógico).
 *
 * Primer uso activo: Servicio y MedioPago (Fase 3). Estos son los primeros
 * modelos que cuelgan de barberia_id y necesitan el aislamiento por tenant,
 * ya que un owner puede tener múltiples barberías y nunca debe ver datos ajenos.
 *
 * Modelos futuros que usarán este scope: Cliente, Corte, Gasto, GastoRegistro.
 *
 * Para activarlo en un modelo, agregar en el booted():
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
        $user = Auth::user();

        if (! $user || $user->isAdmin()) {
            return;
        }

        if ($user->isOwner()) {
            $barberiaIds = $user->barberias()->pluck('id');
            $builder->whereIn($model->qualifyColumn('barberia_id'), $barberiaIds);
            return;
        }

        // barber: solo ve su propia barbería
        $builder->where($model->qualifyColumn('barberia_id'), $user->barberia_id);
    }
}
