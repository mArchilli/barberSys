import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { IconAlertTriangle, IconCircleCheck, IconCreditCard, IconFileInvoice } from '@tabler/icons-react';

const MP_MODE_BADGES = {
    production: { label: 'Modo: Producción', className: 'bg-brand-success-soft text-brand-success' },
    test: { label: 'Modo: Prueba', className: 'bg-brand-warning-soft text-brand-warning' },
    not_configured: { label: 'Sin credenciales', className: 'bg-brand-surface-alt text-brand-text-secondary' },
    unknown: { label: 'Token inválido', className: 'bg-brand-danger-soft text-brand-danger' },
};

function IntegrationRow({ icon: Icon, name, description, badge }) {
    return (
        <li className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex min-w-0 items-start gap-3">
                <Icon size={20} stroke={1.75} className="mt-0.5 shrink-0 text-brand-text-secondary" />
                <div className="min-w-0">
                    <p className="font-medium text-brand-text">{name}</p>
                    <p className="text-xs text-brand-text-secondary">{description}</p>
                </div>
            </div>
            <span className={`inline-flex shrink-0 items-center rounded-brand-pill px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}>
                {badge.label}
            </span>
        </li>
    );
}

function Section({ title, children }) {
    return (
        <div className="rounded-brand-lg border border-brand-border bg-brand-surface p-6 shadow-brand-card">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-text-secondary">{title}</h3>
            <div className="mt-4">{children}</div>
        </div>
    );
}

function JobStatusBadge({ status }) {
    if (status === 'success') {
        return (
            <span className="inline-flex shrink-0 items-center rounded-brand-pill bg-brand-success-soft px-2 py-0.5 text-xs font-medium text-brand-success">
                Exitoso
            </span>
        );
    }

    if (status === 'failed') {
        return (
            <span className="inline-flex shrink-0 items-center rounded-brand-pill bg-brand-danger-soft px-2 py-0.5 text-xs font-medium text-brand-danger">
                Falló
            </span>
        );
    }

    return (
        <span className="inline-flex shrink-0 items-center rounded-brand-pill bg-brand-surface-alt px-2 py-0.5 text-xs font-medium text-brand-text-secondary">
            En curso
        </span>
    );
}

export default function Index({ todoEnOrden, alertaGastos, integraciones, jobRuns, errorLogs }) {
    const mpBadge = MP_MODE_BADGES[integraciones.mercadopago.mode] ?? MP_MODE_BADGES.not_configured;
    return (
        <AdminLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Salud técnica
                </h2>
            }
        >
            <Head title="Salud técnica" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    {/* Indicador general */}
                    {todoEnOrden ? (
                        <div className="flex items-center gap-3 rounded-brand-lg border border-brand-success/30 bg-brand-success-soft p-5 shadow-brand-card">
                            <IconCircleCheck size={28} stroke={1.75} className="shrink-0 text-brand-success" />
                            <div>
                                <p className="font-display text-lg font-bold text-brand-success">Todo en orden</p>
                                <p className="text-sm text-brand-text-secondary">
                                    Los jobs programados corren como se espera y no hay errores recientes.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 rounded-brand-lg border border-brand-danger/30 bg-brand-danger-soft p-5 shadow-brand-card">
                            <IconAlertTriangle size={28} stroke={1.75} className="shrink-0 text-brand-danger" />
                            <div>
                                <p className="font-display text-lg font-bold text-brand-danger">Atención requerida</p>
                                <p className="text-sm text-brand-text-secondary">
                                    Revisá el detalle de jobs y errores más abajo.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Alerta puntual del job de gastos mensuales */}
                    {alertaGastos.activa && (
                        <div className="flex items-start gap-3 rounded-brand-lg border border-brand-warning/30 bg-brand-surface p-5 shadow-brand-card">
                            <IconAlertTriangle size={22} stroke={1.75} className="mt-0.5 shrink-0 text-brand-warning" />
                            <div>
                                <p className="font-medium text-brand-text">
                                    El job de generación de gastos mensuales necesita revisión
                                </p>
                                <p className="mt-1 text-sm text-brand-text-secondary">
                                    {alertaGastos.ultimoStatus === 'failed'
                                        ? 'La última ejecución falló.'
                                        : alertaGastos.ultimoRunExitosoAt
                                          ? `La última ejecución exitosa fue hace ${alertaGastos.diasSinCorrer} días (${alertaGastos.ultimoRunExitosoAt}). Puede ser señal de que el cron dejó de correr en producción.`
                                          : 'Todavía no se registra ninguna ejecución exitosa. Puede ser señal de que el cron nunca corrió en producción.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Estado de integraciones externas: el modo de MP se
                        detecta del prefijo del token, no de una config manual. */}
                    <Section title="Estado de integraciones externas">
                        <ul className="divide-y divide-brand-border">
                            <IntegrationRow
                                icon={IconCreditCard}
                                name="MercadoPago Suscripciones"
                                description={
                                    integraciones.mercadopago.mode === 'unknown'
                                        ? 'El access token cargado no tiene prefijo TEST- ni APP_USR- — revisá la credencial.'
                                        : 'Cobro recurrente por débito automático. El modo se detecta automáticamente del access token.'
                                }
                                badge={mpBadge}
                            />
                            <IntegrationRow
                                icon={IconFileInvoice}
                                name="Facturante"
                                description={
                                    integraciones.facturante.connected
                                        ? 'Factura C automática por cada cobro aprobado.'
                                        : 'Sin API key cargada: los cobros no generan factura automática (modo NullInvoicingService).'
                                }
                                badge={
                                    integraciones.facturante.connected
                                        ? { label: 'Conectado', className: 'bg-brand-success-soft text-brand-success' }
                                        : { label: 'No conectado', className: 'bg-brand-surface-alt text-brand-text-secondary' }
                                }
                            />
                        </ul>
                    </Section>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Section title="Últimas ejecuciones de jobs programados">
                            {jobRuns.length === 0 ? (
                                <p className="text-sm text-brand-text-secondary">Todavía no hay ejecuciones registradas.</p>
                            ) : (
                                <ul className="divide-y divide-brand-border">
                                    {jobRuns.map((run) => (
                                        <li key={run.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-brand-text">{run.job_name}</p>
                                                <p className="text-xs text-brand-text-secondary">
                                                    Inicio: {run.started_at}
                                                    {run.finished_at && <> · Fin: {run.finished_at}</>}
                                                </p>
                                                {run.summary && (
                                                    <p className="mt-1 text-xs text-brand-text-secondary">{run.summary}</p>
                                                )}
                                                {run.error_message && (
                                                    <p className="mt-1 text-xs text-brand-danger">{run.error_message}</p>
                                                )}
                                            </div>
                                            <JobStatusBadge status={run.status} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Section>

                        <Section title="Últimos errores no controlados">
                            {errorLogs.length === 0 ? (
                                <p className="text-sm text-brand-text-secondary">No hay errores registrados.</p>
                            ) : (
                                <ul className="divide-y divide-brand-border">
                                    {errorLogs.map((log) => (
                                        <li key={log.id} className="py-3 first:pt-0 last:pb-0">
                                            <p className="font-medium text-brand-text">{log.exception_class}</p>
                                            <p className="mt-0.5 break-words text-sm text-brand-text-secondary">{log.message}</p>
                                            <p className="mt-1 break-all text-xs text-brand-text-secondary">
                                                {log.file}:{log.line}
                                            </p>
                                            <p className="mt-1 text-xs text-brand-text-secondary">
                                                {log.created_at}
                                                {log.url && <> · {log.url}</>}
                                                {log.user_name && <> · {log.user_name}</>}
                                            </p>
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
