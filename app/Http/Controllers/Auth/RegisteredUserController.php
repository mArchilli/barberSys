<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Barberia;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'plans' => Plan::where('active', true)->get([
                'id', 'name', 'slug', 'max_barberias', 'max_barberos', 'price', 'is_custom',
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password'      => ['required', 'confirmed', Rules\Password::defaults()],
            'plan_id'       => 'required|exists:plans,id',
            'barberia_name' => 'required|string|max:255',
        ]);

        DB::transaction(function () use ($request) {
            $user = User::create([
                'name'     => $request->name,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => 'owner',
            ]);

            Subscription::create([
                'owner_id'      => $user->id,
                'plan_id'       => $request->plan_id,
                'status'        => 'trial',
                'starts_at'     => now()->toDateString(),
                'trial_ends_at' => now()->addDays(14)->toDateString(),
            ]);

            Barberia::create([
                'owner_id' => $user->id,
                'name'     => $request->barberia_name,
            ]);

            event(new Registered($user));

            Auth::login($user);
        });

        return redirect()->route('owner.dashboard');
    }
}
