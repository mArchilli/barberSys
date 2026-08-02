<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateTurnoStatusRequest extends FormRequest
{
    // Compartido entre Owner\TurnoController y BarberTurnoController, mismo
    // criterio que StoreCorteRequest: la pertenencia del turno (barbería o
    // barbero) la valida el controller, no esta autorización de rol.
    public function authorize(): bool
    {
        return Auth::user()->isOwner() || Auth::user()->isBarber();
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['confirmado', 'completado', 'cancelado', 'no_show'])],
        ];
    }
}
