<?php

namespace App\Http\Requests\Owner;

use App\Services\PlanLimitService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreBarberiaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::user()->isOwner();
    }

    public function rules(): array
    {
        return [
            'name'    => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $owner = Auth::user();
            $service = app(PlanLimitService::class);

            if (! $service->canAddBarberia($owner)) {
                $total = $service->currentBarberias($owner);
                $max   = $service->maxBarberias($owner);
                $validator->errors()->add(
                    'plan_limit',
                    "Alcanzaste el límite de tu plan ({$total}/{$max} barberías)."
                );
            }
        });
    }
}
