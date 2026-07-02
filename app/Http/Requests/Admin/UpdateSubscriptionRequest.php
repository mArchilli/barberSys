<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateSubscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'plan_id'               => ['required', 'exists:plans,id'],
            'status'                => ['required', Rule::in(['trial', 'active', 'past_due', 'cancelled'])],
            'starts_at'             => ['required', 'date'],
            'trial_ends_at'         => ['nullable', 'date'],
            'ends_at'               => ['nullable', 'date'],
            'custom_max_barberias'  => ['nullable', 'integer', 'min:0'],
            'custom_max_barberos'   => ['nullable', 'integer', 'min:0'],
        ];
    }
}
