<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ApplyCouponRequest;
use App\Http\Requests\Admin\UpdateSubscriptionRequest;
use App\Models\AdminActivityLog;
use App\Models\Subscription;
use App\Models\User;
use App\Services\CouponRedemptionService;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    private const LOGGED_FIELDS = [
        'plan_id', 'billing_cycle', 'status', 'starts_at', 'trial_ends_at', 'ends_at',
        'custom_max_barberias', 'custom_max_barberos', 'custom_price', 'custom_annual_price',
        'coupon_id', 'coupon_discount_snapshot',
    ];

    public function update(UpdateSubscriptionRequest $request, User $owner)
    {
        abort_unless($owner->role === 'owner', 404);

        $subscription = Subscription::firstOrNew(['owner_id' => $owner->id]);
        $wasExisting = $subscription->exists;
        $before = $wasExisting ? $subscription->only(self::LOGGED_FIELDS) : null;

        $subscription->fill($request->validated());
        $subscription->owner_id = $owner->id;
        $subscription->save();

        AdminActivityLog::create([
            'admin_id'        => Auth::id(),
            'action'          => $wasExisting ? 'subscription.updated' : 'subscription.created',
            'target_owner_id' => $owner->id,
            'detalle'         => [
                'before' => $before,
                'after'  => $subscription->only(self::LOGGED_FIELDS),
            ],
        ]);

        return redirect()
            ->route('admin.owners.show', $owner)
            ->with('success', 'Suscripción actualizada.');
    }

    public function applyCoupon(ApplyCouponRequest $request, User $owner, CouponRedemptionService $couponService)
    {
        abort_unless($owner->role === 'owner', 404);

        $subscription = Subscription::where('owner_id', $owner->id)->firstOrFail();
        $before = $subscription->only(self::LOGGED_FIELDS);

        try {
            $couponService->apply($request->validated()['code'], $subscription, $subscription->plan_id);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['code' => $e->getMessage()]);
        }

        AdminActivityLog::create([
            'admin_id'        => Auth::id(),
            'action'          => 'subscription.coupon_applied',
            'target_owner_id' => $owner->id,
            'detalle'         => [
                'before' => $before,
                'after'  => $subscription->fresh()->only(self::LOGGED_FIELDS),
            ],
        ]);

        return redirect()
            ->route('admin.owners.show', $owner)
            ->with('success', 'Cupón aplicado.');
    }

    public function removeCoupon(User $owner, CouponRedemptionService $couponService)
    {
        abort_unless($owner->role === 'owner', 404);

        $subscription = Subscription::where('owner_id', $owner->id)->firstOrFail();
        $before = $subscription->only(self::LOGGED_FIELDS);

        $couponService->remove($subscription);

        AdminActivityLog::create([
            'admin_id'        => Auth::id(),
            'action'          => 'subscription.coupon_removed',
            'target_owner_id' => $owner->id,
            'detalle'         => [
                'before' => $before,
                'after'  => $subscription->fresh()->only(self::LOGGED_FIELDS),
            ],
        ]);

        return redirect()
            ->route('admin.owners.show', $owner)
            ->with('success', 'Cupón quitado.');
    }
}
