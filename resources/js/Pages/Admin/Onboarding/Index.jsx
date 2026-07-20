import MetricCard from '@/Components/MetricCard';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { IconCheck, IconX } from '@tabler/icons-react';

function Section({ title, children }) {
    return (
        <div className="rounded-brand-lg border border-brand-border bg-brand-surface p-6 shadow-brand-card">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-text-secondary">{title}</h3>
            <div className="mt-4">{children}</div>
        </div>
    );
}

function ChecklistBadge({ label, done }) {
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-brand-pill px-2 py-1 text-xs font-medium ${
                done ? 'bg-brand-success-soft text-brand-success' : 'bg-brand-surface-alt text-brand-text-secondary'
            }`}
        >
            {done ? <IconCheck className="h-3.5 w-3.5" stroke={2.8} /> : <IconX className="h-3.5 w-3.5" stroke={2.2} />}
            {label}
        </span>
    );
}

function DiasBadge({ dias }) {
    let tone = 'bg-brand-surface-alt text-brand-text-secondary';
    if (dias >= 14) {
        tone = 'bg-brand-danger-soft text-brand-danger';
    } else if (dias >= 7) {
        tone = 'bg-brand-warning-soft text-brand-warning';
    }

    return (
        <span className={`inline-flex shrink-0 items-center rounded-brand-pill px-2.5 py-1 text-xs font-medium ${tone}`}>
            {dias === 0 ? 'Hoy' : `Hace ${dias} día${dias === 1 ? '' : 's'}`}
        </span>
    );
}

function OwnerRow({ owner, muted = false }) {
    return (
        <li className={`py-4 first:pt-0 last:pb-0 ${muted ? 'opacity-60' : ''}`}>
            <Link
                href={route('admin.owners.show', owner.owner_id)}
                className="flex flex-col gap-3 rounded-brand-sm p-2 -m-2 hover:bg-brand-bg sm:flex-row sm:items-center sm:justify-between"
            >
                <div className="min-w-0">
                    <p className="truncate font-medium text-brand-text">{owner.owner_name}</p>
                    <p className="truncate text-xs text-brand-text-secondary">
                        {owner.owner_email}
                        {owner.owner_phone && <> · {owner.owner_phone}</>}
                        {' · registrado el '}
                        {owner.created_at}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
                    <ChecklistBadge label="Servicio" done={owner.has_servicio} />
                    <ChecklistBadge label="Medio de pago" done={owner.has_medio_pago} />
                    <ChecklistBadge label="Barbero" done={owner.has_barbero} />
                    <ChecklistBadge label="Corte" done={owner.has_corte} />
                    <DiasBadge dias={owner.dias_desde_registro} />
                </div>
            </Link>
        </li>
    );
}

export default function Index({ owners }) {
    const pendientes = owners.filter((owner) => !owner.activado);
    const activados = owners.filter((owner) => owner.activado);

    return (
        <AdminLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Onboarding de clientes nuevos
                </h2>
            }
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
        >
            <Head title="Onboarding" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-[1720px] space-y-8 px-2 sm:px-3 lg:px-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <MetricCard
                            label="Sin activar (últimos 30 días)"
                            value={pendientes.length}
                            tone={pendientes.length > 0 ? 'warning' : 'default'}
                        />
                        <MetricCard label="Activados (con al menos un corte)" value={activados.length} tone="success" />
                    </div>

                    <Section title="Necesitan seguimiento">
                        {pendientes.length === 0 ? (
                            <p className="text-sm text-brand-text-secondary">
                                Todos los owners registrados en los últimos 30 días ya cargaron al menos un corte.
                            </p>
                        ) : (
                            <ul className="divide-y divide-brand-border">
                                {pendientes.map((owner) => (
                                    <OwnerRow key={owner.owner_id} owner={owner} />
                                ))}
                            </ul>
                        )}
                    </Section>

                    {activados.length > 0 && (
                        <Section title="Ya activados">
                            <ul className="divide-y divide-brand-border">
                                {activados.map((owner) => (
                                    <OwnerRow key={owner.owner_id} owner={owner} muted />
                                ))}
                            </ul>
                        </Section>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
