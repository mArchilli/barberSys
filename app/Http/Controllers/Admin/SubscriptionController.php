<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSubscriptionRequest;
use App\Models\AdminActivityLog;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    private const LOGGED_FIELDS = [
        'plan_id', 'status', 'starts_at', 'trial_ends_at', 'ends_at',
        'custom_max_barberias', 'custom_max_barberos',
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
}
