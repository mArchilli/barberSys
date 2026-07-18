<?php

namespace App\Http\Requests\Owner;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
     *
     * billing_cycle se elige acá porque es la última oportunidad antes de
     * crear el Plan de MercadoPago (el ciclo queda fijo una vez armado el
     * preapproval — cambiarlo después implica cancelar y reactivar).
     */
    public function rules(): array
    {
        return [
            'cuit' => ['nullable', 'string', 'max:13', 'regex:/^[0-9][0-9-]{5,12}$/'],
            'razon_social' => ['nullable', 'string', 'max:255'],
            'billing_cycle' => ['required', Rule::in(['monthly', 'annual'])],
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
