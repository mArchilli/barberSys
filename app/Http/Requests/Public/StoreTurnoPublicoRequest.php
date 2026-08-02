<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;

class StoreTurnoPublicoRequest extends FormRequest
{
    // Sin usuario autenticado no hay rol que chequear: la pertenencia de
    // servicio/barbero a la barbería la valida PublicTurnoController contra
    // la barbería resuelta por public_slug en la ruta.
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'servicio_id' => ['required', 'integer'],
            // null/ausente = "cualquier barbero disponible" (PublicTurnoController
            // resuelve el candidato entre los que DisponibilidadService listó).
            'barbero_id' => ['nullable', 'integer'],
            'cliente_nombre' => ['required', 'string', 'max:255'],
            'cliente_telefono' => ['required', 'string', 'max:50'],
            'fecha' => ['required', 'date', 'after_or_equal:today'],
            'hora_inicio' => ['required', 'date_format:H:i'],
        ];
    }
}
