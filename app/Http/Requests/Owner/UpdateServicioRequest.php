<?php

namespace App\Http\Requests\Owner;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateServicioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::user()->isOwner();
    }

    public function rules(): array
    {
        return [
            'name'   => ['required', 'string', 'max:255'],
            'price'  => ['required', 'numeric', 'min:0'],
            'active' => ['required', 'boolean'],
        ];
    }
}
