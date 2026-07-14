import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import CouponForm from './Partials/CouponForm';

export default function Edit({ coupon, plans }) {
    const { data, setData, patch, processing, errors, transform } = useForm({
        code: coupon.code,
        type: coupon.type,
        value: String(coupon.value),
        max_uses: coupon.max_uses === null ? '' : String(coupon.max_uses),
        duration_months: coupon.duration_months === null ? '' : String(coupon.duration_months),
        applicable_plan_ids: coupon.applicable_plan_ids ?? [],
        expires_at: coupon.expires_at ?? '',
        active: coupon.active,
    });

    function submit(e) {
        e.preventDefault();

        transform((formData) => ({
            ...formData,
            max_uses: formData.max_uses === '' ? null : formData.max_uses,
            duration_months: formData.duration_months === '' ? null : formData.duration_months,
            expires_at: formData.expires_at === '' ? null : formData.expires_at,
            applicable_plan_ids: formData.applicable_plan_ids.length === 0 ? null : formData.applicable_plan_ids,
        }));

        patch(route('admin.coupons.update', coupon.id));
    }

    return (
        <AdminLayout
            header={
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-brand-text">
                        Editar cupón — {coupon.code}
                    </h2>
                    <Link
                        href={route('admin.coupons.index')}
                        className="text-sm text-brand-text-secondary hover:text-brand-text"
                    >
                        ← Volver a Cupones
                    </Link>
                </div>
            }
        >
            <Head title={`Editar cupón — ${coupon.code}`} />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-brand-lg border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-8">
                        <CouponForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            plans={plans}
                            usedCount={coupon.used_count}
                            submitLabel="Guardar cambios"
                            cancelHref={route('admin.coupons.index')}
                            onSubmit={submit}
                        />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
