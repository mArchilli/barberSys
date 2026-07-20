import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { IconPlus } from '@tabler/icons-react';

const audienceLabel = {
    owner: 'Owners',
    barber: 'Barberos',
    both: 'Owners y barberos',
};

function StatusBadge({ active }) {
    return active ? (
        <span className="inline-flex items-center rounded-full bg-brand-success-soft px-2 py-0.5 text-xs font-medium text-brand-success">
            Activa
        </span>
    ) : (
        <span className="inline-flex items-center rounded-full bg-brand-border px-2 py-0.5 text-xs font-medium text-brand-text-secondary">
            Inactiva
        </span>
    );
}

export default function Index({ surveys }) {
    const { flash } = usePage().props;

    return (
        <AdminLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-brand-text">Encuestas</h2>
                    <Link
                        href={route('admin.surveys.create')}
                        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-brand-pill bg-brand-primary px-4 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover"
                    >
                        <IconPlus size={18} stroke={2} />
                        Nueva encuesta
                    </Link>
                </div>
            }
        >
            <Head title="Encuestas" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-5xl space-y-4 px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="rounded-brand-md border border-brand-success/30 bg-brand-success-soft p-4 text-sm text-brand-success">
                            {flash.success}
                        </div>
                    )}

                    {surveys.length === 0 ? (
                        <div className="rounded-brand-md border border-brand-border bg-brand-surface p-8 text-center text-brand-text-secondary shadow-brand-card">
                            Todavía no creaste ninguna encuesta.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-brand-lg border border-brand-border bg-brand-surface shadow-brand-card">
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs uppercase text-brand-text-secondary">
                                    <tr>
                                        <th className="px-5 py-3">Título</th>
                                        <th className="px-5 py-3">Audiencia</th>
                                        <th className="px-5 py-3">Premio</th>
                                        <th className="px-5 py-3">Estado</th>
                                        <th className="px-5 py-3">Respuestas</th>
                                        <th className="px-5 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border">
                                    {surveys.map((survey) => (
                                        <tr key={survey.id}>
                                            <td className="px-5 py-3 font-semibold text-brand-text">{survey.title}</td>
                                            <td className="px-5 py-3 text-brand-text-secondary">
                                                {audienceLabel[survey.target_audience]}
                                            </td>
                                            <td className="px-5 py-3 text-brand-text-secondary">
                                                {survey.reward_type === 'coupon' ? 'Cupón' : 'Sin premio'}
                                            </td>
                                            <td className="px-5 py-3">
                                                <StatusBadge active={survey.active} />
                                            </td>
                                            <td className="px-5 py-3 text-brand-text-secondary">
                                                {survey.completed_responses_count} de {survey.responses_count}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex justify-end gap-4">
                                                    <Link
                                                        href={route('admin.surveys.resultados', survey.id)}
                                                        className="text-sm font-medium text-brand-primary hover:underline"
                                                    >
                                                        Resultados
                                                    </Link>
                                                    <Link
                                                        href={route('admin.surveys.edit', survey.id)}
                                                        className="text-sm font-medium text-brand-primary hover:underline"
                                                    >
                                                        Editar
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
