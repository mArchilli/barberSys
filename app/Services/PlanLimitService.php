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

    public function maxBarberias(User $owner): ?int
    {
        $subscription = $owner->subscription()->with('plan')->first();

        if (! $subscription) {
            return null;
        }

        return $subscription->maxBarberias();
    }

    public function currentBarberias(User $owner): int
    {
        return $owner->barberias()->where('active', true)->count();
    }

    public function canAddBarberia(User $owner): bool
    {
        $max = $this->maxBarberias($owner);

        if ($max === null) {
            return true;
        }

        return $this->currentBarberias($owner) < $max;
    }
}
