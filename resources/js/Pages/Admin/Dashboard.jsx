import MetricCard from '@/Components/MetricCard';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

function formatMoney(value) {
    return `$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
}

function Section({ title, children }) {
    return (
        <div className="rounded-brand-lg border border-brand-border bg-brand-surface p-6 shadow-brand-card">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-text-secondary">{title}</h3>
            <div className="mt-4">{children}</div>
        </div>
    );
}

function PlanBar({ plan, maxMrr }) {
    const width = maxMrr > 0 ? Math.max((plan.mrr / maxMrr) * 100, 4) : 0;

    return (
        <div>
            <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium text-brand-text">{plan.plan_name}</span>
                <span className="text-brand-text-secondary">
                    {plan.subscriptions_count} suscripción(es) · {formatMoney(plan.mrr)}
                </span>
            </div>
            <div className="mt-1.5 h-2.5 w-full rounded-brand-pill bg-brand-surface-alt">
                <div
                    className="h-2.5 rounded-brand-pill bg-brand-primary"
                    style={{ width: `${width}%` }}
                />
            </div>
        </div>
    );
}

export default function Dashboard({
    activeClientsCount,
    trialClientsCount,
    mrr,
    mrrByPlan,
    trialsExpiringSoonCount,
    trialsExpiringSoon,
    inactiveOwners,
    ownersNearPlanLimit,
}) {
    const maxMrr = mrrByPlan.reduce((max, p) => Math.max(max, p.mrr), 0);

    return (
        <AdminLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Panel de administración
                </h2>
            }
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
        >
            <Head title="Administración" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-[1720px] space-y-8 px-2 sm:px-3 lg:px-4">
                    {/* Salud del negocio */}
                    <section>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-text-secondary">
                            Salud del negocio
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-brand-lg bg-brand-nav-bg p-5 shadow-brand-card">
                                <p className="text-sm font-medium text-brand-nav-text">MRR</p>
                                <p className="mt-1 font-display text-3xl font-bold text-brand-nav-active">
                                    {formatMoney(mrr)}
                                </p>
                            </div>
                            <MetricCard label="Clientes activos" value={activeClientsCount} />
                            <MetricCard label="En trial" value={trialClientsCount} />
                            <MetricCard
                                label="Trials por vencer (7 días)"
                                value={trialsExpiringSoonCount}
                                tone={trialsExpiringSoonCount > 0 ? 'warning' : 'default'}
                            />
                        </div>
                    </section>

                    {/* Distribución por plan */}
                    <Section title="Distribución por plan">
                        {mrrByPlan.length === 0 ? (
                            <p className="text-sm text-brand-text-secondary">Todavía no hay suscripciones activas.</p>
                        ) : (
                            <div className="space-y-4">
                                {mrrByPlan.map((plan) => (
                                    <PlanBar key={plan.plan_id} plan={plan} maxMrr={maxMrr} />
                                ))}
                            </div>
                        )}
                    </Section>

                    {/* Riesgo y oportunidad */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Section title="Owners inactivos">
                            {inactiveOwners.length === 0 ? (
                                <p className="text-sm text-brand-text-secondary">No hay owners inactivos.</p>
                            ) : (
                                <ul className="divide-y divide-brand-border">
                                    {inactiveOwners.map((row) => (
                                        <li key={row.owner_id + '-' + row.barberia_name}>
                                            <Link
                                                href={route('admin.owners.show', row.owner_id)}
                                                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:bg-brand-bg"
                                            >
                                                <div>
                                                    <p className="font-medium text-brand-text">{row.owner_name}</p>
                                                    <p className="text-xs text-brand-text-secondary">
                                                        {row.barberia_name} · último corte:{' '}
                                                        {row.last_corte_at ?? 'nunca'}
                                                    </p>
                                                </div>
                                                <span className="inline-flex shrink-0 items-center rounded-full bg-brand-danger-soft px-2 py-0.5 text-xs font-medium text-brand-danger">
                                                    Riesgo
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Section>

                        <Section title="Owners cerca del límite de plan">
                            {ownersNearPlanLimit.length === 0 ? (
                                <p className="text-sm text-brand-text-secondary">Ningún owner está cerca de su límite.</p>
                            ) : (
                                <ul className="divide-y divide-brand-border">
                                    {ownersNearPlanLimit.map((row) => (
                                        <li key={row.owner_id}>
                                            <Link
                                                href={route('admin.owners.show', row.owner_id)}
                                                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:bg-brand-bg"
                                            >
                                                <div>
                                                    <p className="font-medium text-brand-text">{row.owner_name}</p>
                                                    <p className="text-xs text-brand-text-secondary">
                                                        {row.plan_name} · {row.barberias} barberías · {row.barberos} barberos
                                                    </p>
                                                </div>
                                                <span className="inline-flex shrink-0 items-center rounded-full bg-brand-primary-soft px-2 py-0.5 text-xs font-medium text-brand-primary-soft-text">
                                                    Upsell
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Section>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
