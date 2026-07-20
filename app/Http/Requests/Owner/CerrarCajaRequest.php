<?php

namespace App\Http\Requests\Owner;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class CerrarCajaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::user()->isOwner();
    }

    public function rules(): array
    {
        return [
            'day' => ['required', 'date', 'before_or_equal:today'],

            // El conteo es opcional e independiente por medio de pago: no
            // se exige que estén todos completos, ni siquiera que venga el
            // array. Cualquier medio sin conteo queda "sin verificar".
            'conteos' => ['nullable', 'array'],
            'conteos.*' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
