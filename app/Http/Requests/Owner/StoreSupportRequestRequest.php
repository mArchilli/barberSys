<?php

namespace App\Http\Requests\Owner;

use Illuminate\Foundation\Http\FormRequest;

class StoreSupportRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isOwner();
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'max:2000'],
        ];
    }
}
