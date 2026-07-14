<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Barberia;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Rules\StrongPassword;
use App\Services\CouponRedemptionService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'plans' => Plan::where('active', true)->get([
                'id', 'name', 'slug', 'max_barberias', 'max_barberos', 'price', 'is_custom', 'included_items',
            ]),
        ]);
    }

    public function store(Request $request, CouponRedemptionService $couponService): RedirectResponse
    {
        $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password'      => ['required', 'confirmed', new StrongPassword()],
            'plan_id'       => 'required|exists:plans,id',
            'barberia_name' => 'required|string|max:255',
            'coupon_code'   => ['nullable', 'string', 'max:64'],
        ]);

        try {
            DB::transaction(function () use ($request, $couponService) {
                $user = User::create([
                    'name'     => $request->name,
                    'email'    => $request->email,
                    'password' => Hash::make($request->password),
                    'role'     => 'owner',
                    'must_change_password' => false,
                ]);

                $subscription = Subscription::create([
                    'owner_id'      => $user->id,
                    'plan_id'       => $request->plan_id,
                    'status'        => 'trial',
                    'starts_at'     => now()->toDateString(),
                    'trial_ends_at' => now()->addDays(14)->toDateString(),
                ]);

                if ($request->filled('coupon_code')) {
                    $couponService->redeem(strtoupper(trim($request->coupon_code)), $subscription, (int) $request->plan_id);
                }

                Barberia::create([
                    'owner_id' => $user->id,
                    'name'     => $request->barberia_name,
                ]);

                event(new Registered($user));

                Auth::login($user);
            });
        } catch (\RuntimeException $e) {
            return back()->withErrors(['coupon_code' => $e->getMessage()])->withInput();
        }

        return redirect()->route('dashboard');
    }

    /**
     * Feedback en vivo del cupón en el paso 2 del registro (antes de enviar
     * el formulario completo). No canjea ni bloquea el registro si falla.
     */
    public function checkCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code'    => 'required|string|max:64',
            'plan_id' => 'required|exists:plans,id',
        ]);

        $result = app(CouponRedemptionService::class)->checkCode(
            strtoupper(trim($request->string('code'))),
            (int) $request->integer('plan_id')
        );

        return response()->json($result);
    }
}
