import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import CouponForm from './Partials/CouponForm';

export default function Create({ plans }) {
    const { data, setData, post, processing, errors, transform } = useForm({
        code: '',
        type: 'percentage',
        value: '',
        max_uses: '',
        duration_months: '',
        applicable_plan_ids: [],
        expires_at: '',
        active: true,
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

        post(route('admin.coupons.store'));
    }

    return (
        <AdminLayout
            header={
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-brand-text">
                        Nuevo cupón
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
            <Head title="Nuevo cupón" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-brand-lg border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-8">
                        <CouponForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            plans={plans}
                            submitLabel="Crear cupón"
                            cancelHref={route('admin.coupons.index')}
                            onSubmit={submit}
                        />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
