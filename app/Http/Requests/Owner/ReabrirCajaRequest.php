<?php

namespace App\Http\Requests\Owner;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class ReabrirCajaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::user()->isOwner();
    }

    public function rules(): array
    {
        return [
            'day' => ['required', 'date'],
        ];
    }
}
