<?php

namespace App\Http\Requests\Owner;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::user()->isOwner();
    }

    public function rules(): array
    {
        return [
            'name'   => ['required', 'string', 'max:255'],
            'phone'  => ['nullable', 'string', 'max:50'],
            'active' => ['required', 'boolean'],
        ];
    }
}
