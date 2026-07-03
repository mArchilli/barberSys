<?php

namespace Database\Factories;

use App\Models\Plan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Subscription>
 */
class SubscriptionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'owner_id' => User::factory()->owner(),
            'plan_id' => Plan::factory(),
            'custom_max_barberias' => null,
            'custom_max_barberos' => null,
            'status' => 'active',
            'starts_at' => now()->subMonth(),
            'trial_ends_at' => null,
            'ends_at' => null,
        ];
    }
}
