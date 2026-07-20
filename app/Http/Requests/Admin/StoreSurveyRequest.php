<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class StoreSurveyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'target_audience' => ['required', Rule::in(['owner', 'barber', 'both'])],
            'active' => ['boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'reward_type' => ['required', Rule::in(['none', 'coupon'])],
            'reward_coupon_type' => ['nullable', 'required_if:reward_type,coupon', Rule::in(['percentage', 'fixed'])],
            'reward_coupon_value' => ['nullable', 'required_if:reward_type,coupon', 'numeric', 'min:0'],
            'reward_coupon_duration_months' => ['nullable', 'integer', 'min:1'],
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.type' => ['required', Rule::in(['rating', 'text'])],
            'questions.*.question_text' => ['required', 'string', 'max:500'],
            'questions.*.order' => ['nullable', 'integer', 'min:0'],
            'questions.*.scale_min' => ['nullable', 'integer', 'min:0'],
            'questions.*.scale_max' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
