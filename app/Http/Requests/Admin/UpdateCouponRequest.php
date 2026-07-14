<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class UpdateCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'code'                 => ['required', 'string', 'max:64', 'alpha_dash', Rule::unique('coupons', 'code')->ignore($this->route('coupon'))],
            'type'                 => ['required', Rule::in(['percentage', 'fixed'])],
            'value'                => ['required', 'numeric', 'min:0'],
            'max_uses'             => ['nullable', 'integer', 'min:1'],
            'duration_months'      => ['nullable', 'integer', 'min:1'],
            'applicable_plan_ids'  => ['nullable', 'array'],
            'applicable_plan_ids.*' => ['integer', 'exists:plans,id'],
            'expires_at'           => ['nullable', 'date'],
            'active'               => ['boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'code' => strtoupper(trim((string) $this->input('code', ''))),
        ]);
    }
}
