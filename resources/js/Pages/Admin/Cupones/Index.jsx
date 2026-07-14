import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { IconPlus } from '@tabler/icons-react';

function formatValue(type, value) {
    return type === 'percentage'
        ? `${Number(value).toLocaleString('es-AR')}%`
        : `$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatUses(usedCount, maxUses) {
    return maxUses === null ? `${usedCount} de ilimitado` : `${usedCount} de ${maxUses}`;
}

function formatVigencia(expiresAt) {
    return expiresAt ?? 'Sin vencimiento';
}

function StatusBadge({ active }) {
    return active ? (
        <span className="inline-flex items-center rounded-full bg-brand-success-soft px-2 py-0.5 text-xs font-medium text-brand-success">
            Activo
        </span>
    ) : (
        <span className="inline-flex items-center rounded-full bg-brand-border px-2 py-0.5 text-xs font-medium text-brand-text-secondary">
            Inactivo
        </span>
    );
}

export default function Index({ coupons }) {
    const { flash } = usePage().props;

    return (
        <AdminLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-brand-text">
                        Cupones
                    </h2>
                    <Link
                        href={route('admin.coupons.create')}
                        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-brand-pill bg-brand-primary px-4 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover"
                    >
                        <IconPlus size={18} stroke={2} />
                        Nuevo cupón
                    </Link>
                </div>
            }
        >
            <Head title="Cupones" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="rounded-brand-md border border-brand-success/30 bg-brand-success-soft p-4 text-sm text-brand-success">
                            {flash.success}
                        </div>
                    )}

                    {coupons.length === 0 ? (
                        <div className="rounded-brand-md border border-brand-border bg-brand-surface p-8 text-center text-brand-text-secondary shadow-brand-card">
                            Todavía no cargaste ningún cupón.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-brand-lg border border-brand-border bg-brand-surface shadow-brand-card">
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs uppercase text-brand-text-secondary">
                                    <tr>
                                        <th className="px-5 py-3">Código</th>
                                        <th className="px-5 py-3">Tipo</th>
                                        <th className="px-5 py-3">Valor</th>
                                        <th className="px-5 py-3">Usos</th>
                                        <th className="px-5 py-3">Vigencia</th>
                                        <th className="px-5 py-3">Estado</th>
                                        <th className="px-5 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border">
                                    {coupons.map((c) => (
                                        <tr key={c.id}>
                                            <td className="px-5 py-3 font-semibold text-brand-text">{c.code}</td>
                                            <td className="px-5 py-3 text-brand-text-secondary">
                                                {c.type === 'percentage' ? 'Porcentaje' : 'Monto fijo'}
                                            </td>
                                            <td className="px-5 py-3 text-brand-text">{formatValue(c.type, c.value)}</td>
                                            <td className="px-5 py-3 text-brand-text-secondary">
                                                {formatUses(c.used_count, c.max_uses)}
                                            </td>
                                            <td className="px-5 py-3 text-brand-text-secondary">{formatVigencia(c.expires_at)}</td>
                                            <td className="px-5 py-3">
                                                <StatusBadge active={c.active} />
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <Link
                                                    href={route('admin.coupons.edit', c.id)}
                                                    className="text-sm font-medium text-brand-primary hover:underline"
                                                >
                                                    Editar
                                                </Link>
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
