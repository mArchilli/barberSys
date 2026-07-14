import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PlanForm from './Partials/PlanForm';

export default function Edit({ plan, knownFeatures, subscriberUsage }) {
    const { data, setData, patch, processing, errors, transform } = useForm({
        name: plan.name,
        slug: plan.slug,
        price: String(plan.price),
        max_barberias: plan.max_barberias === null ? '' : String(plan.max_barberias),
        max_barberos: plan.max_barberos === null ? '' : String(plan.max_barberos),
        is_custom: plan.is_custom,
        active: plan.active,
        features: plan.features ?? {},
        included_items: plan.included_items ?? [],
    });

    function submit(e) {
        e.preventDefault();

        transform((formData) => ({
            ...formData,
            max_barberias: formData.max_barberias === '' ? null : formData.max_barberias,
            max_barberos: formData.max_barberos === '' ? null : formData.max_barberos,
        }));

        patch(route('admin.plans.update', plan.id));
    }

    return (
        <AdminLayout
            header={
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-brand-text">
                        Editar plan — {plan.name}
                    </h2>
                    <Link
                        href={route('admin.plans.index')}
                        className="text-sm text-brand-text-secondary hover:text-brand-text"
                    >
                        ← Volver a Planes
                    </Link>
                </div>
            }
        >
            <Head title={`Editar plan — ${plan.name}`} />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-brand-lg border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-8">
                        <PlanForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            knownFeatures={knownFeatures}
                            subscriberUsage={subscriberUsage}
                            submitLabel="Guardar cambios"
                            cancelHref={route('admin.plans.index')}
                            onSubmit={submit}
                        />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
