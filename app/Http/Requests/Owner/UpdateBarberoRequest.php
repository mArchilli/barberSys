<?php

namespace App\Http\Requests\Owner;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateBarberoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::user()->isOwner();
    }

    public function rules(): array
    {
        $barberoId = $this->route('barbero')->id;

        return [
            'name'           => ['required', 'string', 'max:255'],
            'email'          => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($barberoId)],
            'phone'          => ['nullable', 'string', 'max:30'],
            'salary_type'    => ['required', Rule::in(['fixed', 'commission'])],
            'salary_amount'  => ['required_if:salary_type,fixed', 'nullable', 'numeric', 'min:0'],
            'commission_pct' => ['required_if:salary_type,commission', 'nullable', 'numeric', 'min:0', 'max:100'],
            'active'         => ['required', 'boolean'],
        ];
    }
}
