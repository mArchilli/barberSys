import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Index({ requests }) {
    return (
        <AdminLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Soporte
                </h2>
            }
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
        >
            <Head title="Soporte" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-[1720px] space-y-4 px-2 sm:px-3 lg:px-4">
                    {requests.length === 0 ? (
                        <div className="rounded-brand-md border border-brand-border bg-brand-surface p-8 text-center text-brand-text-secondary shadow-brand-card">
                            Todavía no hay consultas de soporte registradas.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-brand-lg border border-brand-border bg-brand-surface shadow-brand-card">
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs uppercase text-brand-text-secondary">
                                    <tr>
                                        <th className="px-5 py-3">Owner</th>
                                        <th className="px-5 py-3">Email</th>
                                        <th className="px-5 py-3">Mensaje</th>
                                        <th className="px-5 py-3">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border">
                                    {requests.map((r) => (
                                        <tr key={r.id}>
                                            <td className="px-5 py-3 font-semibold text-brand-text">{r.owner_name}</td>
                                            <td className="px-5 py-3 text-brand-text-secondary">{r.owner_email}</td>
                                            <td className="max-w-md whitespace-pre-wrap px-5 py-3 text-brand-text-secondary">
                                                {r.message}
                                            </td>
                                            <td className="px-5 py-3 text-brand-text-secondary">{r.created_at}</td>
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
