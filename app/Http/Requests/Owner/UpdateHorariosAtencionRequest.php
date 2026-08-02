<?php

namespace App\Http\Requests\Owner;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateHorariosAtencionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::user()->isOwner();
    }

    public function rules(): array
    {
        return [
            'horarios' => ['present', 'array'],
            'horarios.*.dia_semana' => ['required', 'integer', 'between:0,6'],
            'horarios.*.hora_inicio' => ['required', 'date_format:H:i'],
            'horarios.*.hora_fin' => ['required', 'date_format:H:i'],
            'horarios.*.activo' => ['required', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            foreach ($this->input('horarios', []) as $index => $horario) {
                if (! isset($horario['hora_inicio'], $horario['hora_fin'])) {
                    continue;
                }

                if ($horario['hora_fin'] <= $horario['hora_inicio']) {
                    $validator->errors()->add(
                        "horarios.{$index}.hora_fin",
                        'La hora de fin tiene que ser posterior a la hora de inicio.'
                    );
                }
            }
        });
    }
}
