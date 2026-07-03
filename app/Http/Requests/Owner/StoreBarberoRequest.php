<?php

namespace App\Http\Requests\Owner;

use App\Services\PlanLimitService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class StoreBarberoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::user()->isOwner();
    }

    public function rules(): array
    {
        return [
            'name'           => ['required', 'string', 'max:255'],
            'email'          => ['required', 'string', 'email', 'max:255', Rule::unique('users')],
            'phone'          => ['nullable', 'string', 'max:30'],
            'salary_type'    => ['required', Rule::in(['fixed', 'commission'])],
            'salary_amount'  => ['required_if:salary_type,fixed', 'nullable', 'numeric', 'min:0'],
            'commission_pct' => ['required_if:salary_type,commission', 'nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $owner = Auth::user();
            $service = app(PlanLimitService::class);

            if (! $service->canAddBarbero($owner)) {
                $total = $service->currentBarberos($owner);
                $max   = $service->maxBarberos($owner);
                $validator->errors()->add(
                    'plan_limit',
                    "Alcanzaste el límite de tu plan ({$total}/{$max} barberos en total entre todas tus barberías)."
                );
            }
        });
    }
}
