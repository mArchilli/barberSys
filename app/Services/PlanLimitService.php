<?php

namespace App\Services;

use App\Models\User;

class PlanLimitService
{
    public function maxBarberos(User $owner): ?int
    {
        $subscription = $owner->subscription()->with('plan')->first();

        if (! $subscription) {
            return null;
        }

        return $subscription->maxBarberos();
    }

    public function currentBarberos(User $owner): int
    {
        $barberiaIds = $owner->barberias()->pluck('id');

        return User::whereIn('barberia_id', $barberiaIds)
            ->where('role', 'barber')
            ->where('active', true)
            ->count();
    }

    public function canAddBarbero(User $owner): bool
    {
        $max = $this->maxBarberos($owner);

        if ($max === null) {
            return true;
        }

        return $this->currentBarberos($owner) < $max;
    }
}
