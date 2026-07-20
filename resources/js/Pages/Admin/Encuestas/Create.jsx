import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import SurveyForm from './Partials/SurveyForm';

export default function Create() {
    const { data, setData, post, processing, errors, transform } = useForm({
        title: '',
        description: '',
        target_audience: 'owner',
        active: true,
        starts_at: '',
        ends_at: '',
        reward_type: 'none',
        reward_coupon_type: 'percentage',
        reward_coupon_value: '',
        reward_coupon_duration_months: '',
        questions: [{ type: 'rating', question_text: '', order: 0, scale_min: 1, scale_max: 5 }],
    });

    function submit(e) {
        e.preventDefault();

        transform((formData) => ({
            ...formData,
            starts_at: formData.starts_at === '' ? null : formData.starts_at,
            ends_at: formData.ends_at === '' ? null : formData.ends_at,
            reward_coupon_duration_months:
                formData.reward_coupon_duration_months === '' ? null : formData.reward_coupon_duration_months,
            reward_coupon_type: formData.reward_type === 'coupon' ? formData.reward_coupon_type : null,
            reward_coupon_value: formData.reward_type === 'coupon' ? formData.reward_coupon_value : null,
        }));

        post(route('admin.surveys.store'));
    }

    return (
        <AdminLayout
            header={
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-brand-text">Nueva encuesta</h2>
                    <Link
                        href={route('admin.surveys.index')}
                        className="text-sm text-brand-text-secondary hover:text-brand-text"
                    >
                        ← Volver a Encuestas
                    </Link>
                </div>
            }
        >
            <Head title="Nueva encuesta" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-brand-lg border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-8">
                        <SurveyForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            submitLabel="Crear encuesta"
                            cancelHref={route('admin.surveys.index')}
                            onSubmit={submit}
                        />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
