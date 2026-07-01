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
            'barberia_id' => ['required', 'integer', 'exists:barberias,id'],
            'name'        => ['required', 'string', 'max:255'],
            'price'       => ['required', 'numeric', 'min:0'],
            'active'      => ['required', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $barberiaIds = Auth::user()->barberias()->pluck('id');
            if (! $barberiaIds->contains((int) $this->barberia_id)) {
                $validator->errors()->add('barberia_id', 'La barbería seleccionada no te pertenece.');
            }
        });
    }
}
