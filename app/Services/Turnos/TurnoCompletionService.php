<?php

namespace App\Services\Turnos;

use App\Models\Cliente;
use App\Models\Turno;

/**
 * Arma los datos para precargar un corte cuando un turno pasa a
 * 'completado'. El match de cliente tiene dos niveles de confianza:
 * - Teléfono exacto: dato confiable, se asigna cliente_id directo.
 * - Nombre exacto (sin teléfono coincidente): un nombre repetido entre
 *   clientes distintos es un caso real, así que viaja como "sugerido" para
 *   que el frontend lo confirme antes de asociarlo — nunca se asigna solo.
 */
class TurnoCompletionService
{
    /**
     * @return array{servicio_id: int, cliente_nombre: string, cliente_telefono: string, cliente_id: ?int, cliente_sugerido: ?array, barbero_id: ?int, barbero_nombre: ?string}
     */
    public function resolvePrecarga(Turno $turno): array
    {
        $clienteId = null;
        $clienteSugerido = null;

        $matchPorTelefono = Cliente::where('barberia_id', $turno->barberia_id)
            ->where('active', true)
            ->where('phone', $turno->cliente_telefono)
            ->first(['id', 'name', 'phone']);

        if ($matchPorTelefono) {
            $clienteId = $matchPorTelefono->id;
        } else {
            $matchPorNombre = Cliente::where('barberia_id', $turno->barberia_id)
                ->where('active', true)
                ->whereRaw('LOWER(name) = ?', [mb_strtolower($turno->cliente_nombre)])
                ->first(['id', 'name', 'phone']);

            if ($matchPorNombre) {
                $clienteSugerido = [
                    'id' => $matchPorNombre->id,
                    'name' => $matchPorNombre->name,
                    'phone' => $matchPorNombre->phone,
                ];
            }
        }

        return [
            'servicio_id' => $turno->servicio_id,
            'cliente_nombre' => $turno->cliente_nombre,
            'cliente_telefono' => $turno->cliente_telefono,
            'cliente_id' => $clienteId,
            'cliente_sugerido' => $clienteSugerido,
            'barbero_id' => $turno->barbero_id,
            'barbero_nombre' => $turno->barbero?->name,
        ];
    }
}
