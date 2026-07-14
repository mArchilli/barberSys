<?php

namespace App\Http\Requests\Admin;

use App\Models\Plan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StorePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name'           => ['required', 'string', 'max:255'],
            'slug'           => ['required', 'string', 'max:255', 'alpha_dash', 'unique:plans,slug'],
            'max_barberias'  => ['nullable', 'integer', 'min:1'],
            'max_barberos'   => ['nullable', 'integer', 'min:1'],
            'price'          => ['required', 'numeric', 'min:0'],
            'is_custom'      => ['boolean'],
            'active'         => ['boolean'],
            'features'       => ['nullable', 'array'],
            'features.*'     => ['boolean'],
            'included_items'   => ['nullable', 'array'],
            'included_items.*' => ['string', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'features' => array_intersect_key(
                $this->input('features', []),
                Plan::KNOWN_FEATURES
            ),
            'included_items' => array_values(array_filter(array_map(
                fn ($item) => trim((string) $item),
                $this->input('included_items', [])
            ), fn ($item) => $item !== '')),
        ]);
    }
}
