<?php

namespace App\Http\Requests\Owner;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateGastoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::user()->isOwner();
    }

    public function rules(): array
    {
        return [
            'name'         => ['required', 'string', 'max:255'],
            'amount'       => ['required', 'numeric', 'min:0'],
            'type'         => ['required', 'in:fijo,variable'],
            'is_recurring' => ['required', 'boolean'],
            'active'       => ['required', 'boolean'],
        ];
    }
}
