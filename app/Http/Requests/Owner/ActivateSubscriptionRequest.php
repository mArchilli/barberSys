<?php

namespace App\Http\Requests\Owner;

use Illuminate\Foundation\Http\FormRequest;

class ActivateSubscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isOwner();
    }

    /**
     * Datos fiscales OPCIONALES para la factura: si quedan vacíos se emite a
     * consumidor final con el nombre de la cuenta. Se piden acá (activación)
     * y no en el perfil, porque es el único momento donde el owner tiene
     * incentivo real de completarlos.
     */
    public function rules(): array
    {
        return [
            'cuit' => ['nullable', 'string', 'max:13', 'regex:/^[0-9][0-9-]{5,12}$/'],
            'razon_social' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'cuit.regex' => 'Ingresá un CUIT o DNI válido (solo números, con o sin guiones).',
            'cuit.max' => 'El CUIT/DNI no puede superar los 13 caracteres.',
        ];
    }
}
