<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreCorteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::user()->isOwner() || Auth::user()->isBarber();
    }

    public function rules(): array
    {
        return [
            'servicio_id' => ['required', 'integer'],
            'cliente_id' => ['nullable', 'integer'],
            'cliente_nombre' => ['required_without:cliente_id', 'nullable', 'string', 'max:255'],
            'cliente_phone' => ['nullable', 'string', 'max:50'],
            'cliente_email' => ['nullable', 'string', 'email', 'max:255'],
            'medio_pago_id' => ['required', 'integer'],
            'price' => ['required', 'numeric', 'min:0'],
            'performed_at' => ['required', 'date'],
            'quick_entry' => ['nullable', 'boolean'],
        ];
    }
}
