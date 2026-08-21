<?php

namespace Tests\Feature;

use App\Models\Barberia;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RequiredSeedDataTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seed_creates_only_required_admin_and_plan3_owner(): void
    {
        $this->artisan('db:seed', ['--class' => DatabaseSeeder::class])->assertSuccessful();

        $admin = User::where('email', 'estilus.ar@gmail.com')->first();
        $this->assertNotNull($admin);
        $this->assertSame('Estilus', $admin->name);
        $this->assertSame('admin', $admin->role);
        $this->assertTrue((bool) $admin->active);
        $this->assertTrue(Hash::check('Estilusbarber1-', $admin->password));

        $owner = User::where('email', 'user3@estilus.com')->first();
        $this->assertNotNull($owner);
        $this->assertSame('User Plan 3', $owner->name);
        $this->assertSame('owner', $owner->role);
        $this->assertTrue(Hash::check('Estilususer3', $owner->password));

        $subscription = Subscription::where('owner_id', $owner->id)->first();
        $this->assertNotNull($subscription);
        $this->assertSame(Plan::where('slug', 'plan-3')->value('id'), $subscription->plan_id);
        $this->assertSame('active', $subscription->status);

        $barberia = Barberia::where('owner_id', $owner->id)->first();
        $this->assertNotNull($barberia);
        $this->assertSame('Barbería Plan 3', $barberia->name);
        $this->assertTrue((bool) $barberia->active);

        $this->post(route('login'), [
            'email' => 'user3@estilus.com',
            'password' => 'Estilususer3',
        ])->assertRedirect(route('dashboard'));

        $this->get(route('dashboard'))
            ->assertRedirect(route('owner.barberias.index'));

        $this->get(route('owner.barberias.index'))
            ->assertRedirect(route('owner.barberias.dashboard', $barberia));

        $this->get(route('owner.barberias.dashboard', $barberia))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Owner/Barberias/Dashboard')
                ->where('currentBarberia.id', $barberia->id));

        $this->assertDatabaseCount('users', 2);
    }
}
