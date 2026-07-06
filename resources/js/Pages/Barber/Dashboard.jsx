import MonthSelector from '@/Components/MonthSelector';
import RankingList from '@/Components/RankingList';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { IconCoin, IconReceipt2 } from '@tabler/icons-react';

function formatMoney(value) {
    return `$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Dashboard({ period, totalFacturado, totalCortes, porServicio, liquidacion }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Mi panel
                </h2>
            }
        >
            <Head title="Mi panel" />

            <div className="pt-6 pb-24 sm:pt-12 sm:pb-16">
                <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-end">
                        <MonthSelector month={period.month} url={route('barber.dashboard')} />
                    </div>

                    <div className="rounded-brand-xl bg-brand-nav-bg p-6 shadow-brand-floating">
                        <div className="flex items-center gap-4">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-primary/20 text-brand-nav-active">
                                <IconCoin size={24} stroke={1.75} />
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm text-brand-text-on-dark">Tu facturación del período</p>
                                <p className="truncate font-display text-3xl font-bold text-white sm:text-4xl">
                                    {formatMoney(totalFacturado)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 pt-4">
                            <div className="pr-4">
                                <p className="text-xs text-brand-text-on-dark">Tus cortes</p>
                                <p className="mt-1 text-lg font-semibold text-white">{totalCortes}</p>
                            </div>
                            <div className="pl-4">
                                <p className="text-xs text-brand-text-on-dark">
                                    {liquidacion.salaryType === 'fixed' ? 'Liquidación estimada (fijo)' : 'Liquidación estimada (comisión)'}
                                </p>
                                <p className="mt-1 text-lg font-semibold text-white">{formatMoney(liquidacion.monto)}</p>
                            </div>
                        </div>
                    </div>

                    <section className="space-y-3">
                        <h3 className="font-display text-lg font-bold text-brand-text">Tus servicios más prestados</h3>
                        <RankingList items={porServicio} emptyLabel="Todavía no cargaste ningún corte en este período." />
                    </section>
                </div>
            </div>

            <Link
                href={route('barber.cortes.index')}
                className="fixed bottom-4 right-4 z-30 inline-flex h-12 items-center gap-2 rounded-brand-pill bg-brand-primary px-5 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover sm:bottom-6 sm:right-6"
            >
                <IconReceipt2 size={20} stroke={1.75} />
                Cargar corte
            </Link>
        </AuthenticatedLayout>
    );
}
