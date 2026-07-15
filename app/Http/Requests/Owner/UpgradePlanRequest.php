<?php

namespace App\Http\Requests\Owner;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpgradePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isOwner();
    }

    public function rules(): array
    {
        return [
            // Solo planes publicados del catálogo: los planes a medida
            // (is_custom) se gestionan con el equipo, no por autoservicio.
            'plan_id' => [
                'required',
                'integer',
                // Closure y no ->where('col', bool): los wheres planos se
                // stringifican al compilar la regla y un `false` se convierte
                // en cadena vacía, rompiendo la comparación en SQLite.
                Rule::exists('plans', 'id')->where(function ($query) {
                    $query->where('active', true)->where('is_custom', false);
                }),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'plan_id.exists' => 'El plan elegido no está disponible.',
        ];
    }
}
