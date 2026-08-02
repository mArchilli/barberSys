<?php

namespace App\Http\Requests\Owner;

use App\Models\HorarioAtencion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateBarberoDisponibilidadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::user()->isOwner();
    }

    public function rules(): array
    {
        return [
            'disponibilidad' => ['present', 'array'],
            'disponibilidad.*.dia_semana' => ['required', 'integer', 'between:0,6'],
            'disponibilidad.*.hora_inicio' => ['required', 'date_format:H:i'],
            'disponibilidad.*.hora_fin' => ['required', 'date_format:H:i'],
        ];
    }

    // La disponibilidad de un barbero nunca puede exceder el horario
    // general de la barbería para ese mismo día.
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $barberia = $this->route('barberia');
            $filas = $this->input('disponibilidad', []);

            $diasConsultados = collect($filas)->pluck('dia_semana')->unique();
            $horariosPorDia = HorarioAtencion::where('barberia_id', $barberia->id)
                ->where('activo', true)
                ->whereIn('dia_semana', $diasConsultados)
                ->get()
                ->groupBy('dia_semana');

            foreach ($filas as $index => $fila) {
                if (! isset($fila['dia_semana'], $fila['hora_inicio'], $fila['hora_fin'])) {
                    continue;
                }

                if ($fila['hora_fin'] <= $fila['hora_inicio']) {
                    $validator->errors()->add(
                        "disponibilidad.{$index}.hora_fin",
                        'La hora de fin tiene que ser posterior a la hora de inicio.'
                    );
                    continue;
                }

                $horariosDelDia = $horariosPorDia->get($fila['dia_semana']);

                if (! $horariosDelDia || $horariosDelDia->isEmpty()) {
                    $validator->errors()->add(
                        "disponibilidad.{$index}.dia_semana",
                        'La barbería no tiene horario de atención cargado para ese día.'
                    );
                    continue;
                }

                // hora_inicio/hora_fin vuelven de la BD como "HH:MM:SS"; se
                // recortan a "HH:MM" para comparar contra el formato que
                // manda el <input type="time">, si no "09:00" queda (mal)
                // por debajo de "09:00:00" en la comparación de strings.
                $dentroDeAlgunBloque = $horariosDelDia->contains(function ($horario) use ($fila) {
                    $inicio = substr($horario->hora_inicio, 0, 5);
                    $fin    = substr($horario->hora_fin, 0, 5);

                    return $fila['hora_inicio'] >= $inicio && $fila['hora_fin'] <= $fin;
                });

                if (! $dentroDeAlgunBloque) {
                    $validator->errors()->add(
                        "disponibilidad.{$index}.hora_inicio",
                        'La disponibilidad no puede exceder el horario de atención de la barbería ese día.'
                    );
                }
            }
        });
    }
}
