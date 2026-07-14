<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCouponRequest;
use App\Http\Requests\Admin\UpdateCouponRequest;
use App\Models\Coupon;
use App\Models\Plan;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CouponController extends Controller
{
    public function index(): Response
    {
        $coupons = Coupon::orderByDesc('id')->get();

        return Inertia::render('Admin/Cupones/Index', [
            'coupons' => $coupons->map(fn (Coupon $coupon) => [
                'id'               => $coupon->id,
                'code'             => $coupon->code,
                'type'             => $coupon->type,
                'value'            => $coupon->value,
                'max_uses'         => $coupon->max_uses,
                'used_count'       => $coupon->used_count,
                'expires_at'       => $coupon->expires_at?->toDateString(),
                'active'           => $coupon->active,
            ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Cupones/Create', [
            'plans' => Plan::orderBy('id')->get(['id', 'name']),
        ]);
    }

    public function store(StoreCouponRequest $request)
    {
        Coupon::create($request->validated() + ['created_by' => Auth::id()]);

        return redirect()
            ->route('admin.coupons.index')
            ->with('success', 'Cupón creado.');
    }

    public function edit(Coupon $coupon): Response
    {
        return Inertia::render('Admin/Cupones/Edit', [
            'coupon' => [
                'id'                    => $coupon->id,
                'code'                  => $coupon->code,
                'type'                  => $coupon->type,
                'value'                 => $coupon->value,
                'max_uses'              => $coupon->max_uses,
                'used_count'            => $coupon->used_count,
                'duration_months'       => $coupon->duration_months,
                'applicable_plan_ids'   => $coupon->applicable_plan_ids,
                'expires_at'            => $coupon->expires_at?->toDateString(),
                'active'                => $coupon->active,
            ],
            'plans' => Plan::orderBy('id')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateCouponRequest $request, Coupon $coupon)
    {
        $coupon->update($request->validated());

        return redirect()
            ->route('admin.coupons.index')
            ->with('success', 'Cupón actualizado.');
    }
}
