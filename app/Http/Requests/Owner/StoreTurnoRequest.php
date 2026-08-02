<?php

namespace App\Http\Requests\Owner;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreTurnoRequest extends FormRequest
{
    // Carga manual: siempre la hace el owner (o el owner operando como
    // barbero), nunca el barbero desde su propia agenda — ver BarberTurnoController.
    public function authorize(): bool
    {
        return Auth::user()->isOwner();
    }

    public function rules(): array
    {
        return [
            'servicio_id' => ['required', 'integer'],
            'barbero_id' => ['required', 'integer'],
            'cliente_nombre' => ['required', 'string', 'max:255'],
            'cliente_telefono' => ['required', 'string', 'max:50'],
            'fecha' => ['required', 'date', 'after_or_equal:today'],
            'hora_inicio' => ['required', 'date_format:H:i'],
        ];
    }
}
