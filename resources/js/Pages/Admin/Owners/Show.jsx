import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const STATUS_LABELS = {
    trial: 'Trial',
    active: 'Activa',
    past_due: 'Vencida',
    cancelled: 'Cancelada',
};

function Section({ title, children }) {
    return (
        <div className="rounded-brand-lg border border-brand-border bg-brand-surface p-6 shadow-brand-card">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-text-secondary">{title}</h3>
            <div className="mt-4">{children}</div>
        </div>
    );
}

export default function Show({ owner, barberias, subscription, plans, recentCortes, activityLogs }) {
    const { flash } = usePage().props;
    const [showResetPassword, setShowResetPassword] = useState(!!flash?.resetPassword);

    const { data, setData, patch, processing, errors } = useForm({
        plan_id: subscription?.plan_id ?? (plans[0]?.id ?? ''),
        status: subscription?.status ?? 'trial',
        starts_at: subscription?.starts_at ?? new Date().toISOString().slice(0, 10),
        trial_ends_at: subscription?.trial_ends_at ?? '',
        ends_at: subscription?.ends_at ?? '',
        custom_max_barberias: subscription?.custom_max_barberias ?? '',
        custom_max_barberos: subscription?.custom_max_barberos ?? '',
        custom_price: subscription?.custom_price ?? '',
    });

    const selectedPlan = plans.find((p) => String(p.id) === String(data.plan_id));
    const isCustomPlan = !!selectedPlan?.is_custom;

    function submit(e) {
        e.preventDefault();
        patch(route('admin.subscriptions.update', owner.id));
    }

    function handleResetPassword() {
        if (! confirm(`¿Restablecer la contraseña de ${owner.name}? Se generará una nueva contraseña aleatoria y deberá cambiarla al ingresar.`)) return;
        router.patch(route('admin.owners.resetPassword', owner.id));
    }

    return (
        <AdminLayout
            header={
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-brand-text">
                        {owner.name}
                    </h2>
                    <Link
                        href={route('admin.owners.index')}
                        className="text-sm text-brand-text-secondary hover:text-brand-text"
                    >
                        ← Volver a Owners
                    </Link>
                </div>
            }
        >
            <Head title={`Owner — ${owner.name}`} />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="rounded-brand-md border border-brand-success/30 bg-brand-success-soft p-4 text-sm text-brand-success">
                            {flash.success}
                        </div>
                    )}

                    {showResetPassword && flash?.resetPassword && (
                        <div className="rounded-brand-md border border-brand-success/30 bg-brand-success-soft p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="font-semibold text-brand-success">Contraseña reseteada</p>
                                    <p className="mt-1 text-sm text-brand-text-secondary">
                                        Pasale esta contraseña a{' '}
                                        <span className="font-medium text-brand-text">{flash.resetPassword.name}</span>.
                                        No se va a volver a mostrar.
                                    </p>
                                    <p className="mt-2 inline-block rounded-brand-sm border border-brand-success/20 bg-brand-surface px-3 py-2 font-mono text-lg font-bold tracking-widest text-brand-text">
                                        {flash.resetPassword.password}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowResetPassword(false)}
                                    className="shrink-0 text-sm text-brand-text-secondary hover:text-brand-text"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Columna principal */}
                        <div className="space-y-6 lg:col-span-2">
                            <Section title="Datos del owner">
                                <dl className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <dt className="text-brand-text-secondary">Email</dt>
                                        <dd className="font-medium text-brand-text">{owner.email}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-brand-text-secondary">Teléfono</dt>
                                        <dd className="font-medium text-brand-text">{owner.phone ?? '—'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-brand-text-secondary">Alta</dt>
                                        <dd className="font-medium text-brand-text">{owner.created_at}</dd>
                                    </div>
                                </dl>

                                <div className="mt-4 border-t border-brand-border-subtle pt-4">
                                    <button
                                        type="button"
                                        onClick={handleResetPassword}
                                        className="inline-flex items-center justify-center rounded-brand-pill border border-brand-danger/30 px-4 py-2 text-sm font-medium text-brand-danger transition hover:bg-brand-danger-soft"
                                    >
                                        Restablecer contraseña
                                    </button>
                                </div>
                            </Section>

                            <Section title={`Barberías (${barberias.length})`}>
                                {barberias.length === 0 ? (
                                    <p className="text-sm text-brand-text-secondary">Este owner no tiene barberías cargadas.</p>
                                ) : (
                                    <ul className="divide-y divide-brand-border">
                                        {barberias.map((b) => (
                                            <li key={b.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                                                <div>
                                                    <p className="font-medium text-brand-text">{b.name}</p>
                                                    {b.address && <p className="text-xs text-brand-text-secondary">{b.address}</p>}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-brand-text-secondary">{b.barbers_count} barbero(s)</span>
                                                    {!b.active && (
                                                        <span className="inline-flex items-center rounded-full bg-brand-border px-2 py-0.5 text-xs font-medium text-brand-text-secondary">
                                                            Inactiva
                                                        </span>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Section>

                            <Section title="Actividad reciente (últimos cortes)">
                                {recentCortes.length === 0 ? (
                                    <p className="text-sm text-brand-text-secondary">Sin cortes cargados todavía.</p>
                                ) : (
                                    <table className="w-full text-left text-sm">
                                        <thead className="text-xs uppercase text-brand-text-secondary">
                                            <tr>
                                                <th className="py-2 pr-4">Fecha</th>
                                                <th className="py-2 pr-4">Barbería</th>
                                                <th className="py-2 pr-4">Barbero</th>
                                                <th className="py-2 pr-4">Servicio</th>
                                                <th className="py-2 text-right">Precio</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-brand-border">
                                            {recentCortes.map((c) => (
                                                <tr key={c.id}>
                                                    <td className="py-2 pr-4 text-brand-text-secondary">{c.performed_at}</td>
                                                    <td className="py-2 pr-4 text-brand-text">{c.barberia}</td>
                                                    <td className="py-2 pr-4 text-brand-text">{c.barbero}</td>
                                                    <td className="py-2 pr-4 text-brand-text-secondary">{c.servicio}</td>
                                                    <td className="py-2 text-right text-brand-text">
                                                        ${Number(c.price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </Section>

                            <Section title={`Historial de cambios de suscripción (${activityLogs.length})`}>
                                {activityLogs.length === 0 ? (
                                    <p className="text-sm text-brand-text-secondary">No hay cambios registrados todavía.</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {activityLogs.map((log) => (
                                            <li key={log.id} className="rounded-brand-sm border border-brand-border-subtle bg-brand-surface-alt p-3 text-sm">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <span className="font-medium text-brand-text">{log.action}</span>
                                                    <span className="text-xs text-brand-text-secondary">
                                                        {log.admin ?? 'Admin'} · {log.created_at}
                                                    </span>
                                                </div>
                                                {log.detalle && (
                                                    <pre className="mt-2 overflow-x-auto rounded-brand-sm bg-brand-bg p-2 text-xs text-brand-text-secondary">
                                                        {JSON.stringify(log.detalle, null, 2)}
                                                    </pre>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Section>
                        </div>

                        {/* Columna de suscripción */}
                        <div>
                            <Section title="Suscripción">
                                <form onSubmit={submit} className="space-y-4">
                                    <div>
                                        <InputLabel htmlFor="plan_id" value="Plan" />
                                        <select
                                            id="plan_id"
                                            value={data.plan_id}
                                            onChange={(e) => {
                                                const nextPlan = plans.find((p) => String(p.id) === e.target.value);
                                                setData({
                                                    ...data,
                                                    plan_id: e.target.value,
                                                    custom_price: nextPlan?.is_custom ? data.custom_price : '',
                                                });
                                            }}
                                            className="mt-1 block w-full rounded-brand-sm border-brand-border text-sm focus:border-brand-primary focus:ring-brand-primary"
                                        >
                                            {plans.map((p) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.plan_id} className="mt-1" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="status" value="Estado" />
                                        <select
                                            id="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="mt-1 block w-full rounded-brand-sm border-brand-border text-sm focus:border-brand-primary focus:ring-brand-primary"
                                        >
                                            {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.status} className="mt-1" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="starts_at" value="Inicio" />
                                        <TextInput
                                            id="starts_at"
                                            type="date"
                                            value={data.starts_at}
                                            onChange={(e) => setData('starts_at', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.starts_at} className="mt-1" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="trial_ends_at" value="Fin de trial" />
                                        <TextInput
                                            id="trial_ends_at"
                                            type="date"
                                            value={data.trial_ends_at}
                                            onChange={(e) => setData('trial_ends_at', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.trial_ends_at} className="mt-1" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="ends_at" value="Fin de suscripción" />
                                        <TextInput
                                            id="ends_at"
                                            type="date"
                                            value={data.ends_at}
                                            onChange={(e) => setData('ends_at', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.ends_at} className="mt-1" />
                                    </div>

                                    <div className="border-t border-brand-border-subtle pt-4">
                                        <p className="text-xs text-brand-text-secondary">
                                            Límites y precio custom — sólo aplican para planes a medida (ej. Plan 4). Dejar vacío para usar el valor del plan.
                                        </p>

                                        {isCustomPlan && (
                                            <div className="mt-3">
                                                <InputLabel htmlFor="custom_price" value="Precio mensual (custom)" />
                                                <TextInput
                                                    id="custom_price"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={data.custom_price}
                                                    onChange={(e) => setData('custom_price', e.target.value)}
                                                    className="mt-1 block w-full"
                                                />
                                                <InputError message={errors.custom_price} className="mt-1" />
                                            </div>
                                        )}

                                        <div className="mt-3">
                                            <InputLabel htmlFor="custom_max_barberias" value="Máx. barberías (custom)" />
                                            <TextInput
                                                id="custom_max_barberias"
                                                type="number"
                                                min="0"
                                                value={data.custom_max_barberias}
                                                onChange={(e) => setData('custom_max_barberias', e.target.value)}
                                                className="mt-1 block w-full"
                                            />
                                            <InputError message={errors.custom_max_barberias} className="mt-1" />
                                        </div>

                                        <div className="mt-3">
                                            <InputLabel htmlFor="custom_max_barberos" value="Máx. barberos (custom)" />
                                            <TextInput
                                                id="custom_max_barberos"
                                                type="number"
                                                min="0"
                                                value={data.custom_max_barberos}
                                                onChange={(e) => setData('custom_max_barberos', e.target.value)}
                                                className="mt-1 block w-full"
                                            />
                                            <InputError message={errors.custom_max_barberos} className="mt-1" />
                                        </div>
                                    </div>

                                    <PrimaryButton disabled={processing} className="w-full justify-center">
                                        Guardar suscripción
                                    </PrimaryButton>
                                </form>
                            </Section>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
