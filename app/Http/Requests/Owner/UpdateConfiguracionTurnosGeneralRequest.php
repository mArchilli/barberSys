<?php

namespace App\Http\Requests\Owner;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateConfiguracionTurnosGeneralRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::user()->isOwner();
    }

    public function rules(): array
    {
        $barberia = $this->route('barberia');

        return [
            'turnos_enabled' => ['required', 'boolean'],
            'public_slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(-[a-z0-9]+)*$/',
                Rule::unique('barberias', 'public_slug')->ignore($barberia->id),
            ],
            'whatsapp_number' => ['nullable', 'string', 'max:30'],
        ];
    }

    public function messages(): array
    {
        return [
            'public_slug.regex' => 'El slug solo puede tener minúsculas, números y guiones (ej: barberia-centro).',
        ];
    }
}
