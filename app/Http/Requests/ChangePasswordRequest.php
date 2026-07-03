<?php

namespace App\Http\Requests;

use App\Rules\StrongPassword;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        return [
            'password' => ['required', 'string', 'confirmed', new StrongPassword()],
        ];
    }

    public function messages(): array
    {
        return [
            'password.required'  => 'La contraseña es obligatoria.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ];
    }
}
