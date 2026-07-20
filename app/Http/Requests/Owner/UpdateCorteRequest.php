<?php

namespace App\Http\Requests\Owner;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateCorteRequest extends FormRequest
{
    // Separado de StoreCorteRequest a propósito: esta corrección la hace el
    // owner sobre un corte que no necesariamente es suyo (conciliación de
    // caja), así que no debe fijar barbero_id como sí hace la creación.
    public function authorize(): bool
    {
        return Auth::user()->isOwner();
    }

    public function rules(): array
    {
        return [
            'servicio_id' => ['required', 'integer'],
            'cliente_id' => ['required', 'integer'],
            'medio_pago_id' => ['required', 'integer'],
            'price' => ['required', 'numeric', 'min:0'],
        ];
    }
}
