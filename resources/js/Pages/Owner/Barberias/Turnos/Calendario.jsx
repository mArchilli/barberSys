import DaySelector from '@/Components/DaySelector';
import SelectInput from '@/Components/SelectInput';
import CargaManualModal from '@/Components/Turnos/CargaManualModal';
import PublicLinkBanner from '@/Components/Turnos/PublicLinkBanner';
import SugerenciaClienteModal from '@/Components/Turnos/SugerenciaClienteModal';
import TurnoListItem from '@/Components/Turnos/TurnoListItem';
import useTurnoCompletion from '@/Hooks/useTurnoCompletion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { IconCalendarPlus, IconSettings } from '@tabler/icons-react';
import { useState } from 'react';

export default function Calendario({ turnos, barberos, servicios, dia, esHoy, barberoFiltro, publicTurnoUrl }) {
    const { currentBarberia } = usePage().props;
    const barbId = currentBarberia?.id;
    const [modalOpen, setModalOpen] = useState(false);

    const indexUrl = route('owner.barberias.turnos.index', barbId);
    const faltaCatalogo = barberos.length === 0 || servicios.length === 0;

    const { onStatusChange, onConfirm, sugerencia, confirmarSugerencia } = useTurnoCompletion({
        buildUpdateUrl: (turno) => route('owner.barberias.turnos.update', { barberia: barbId, turno: turno.id }),
        buildConfirmUrl: (turno) => route('owner.barberias.turnos.confirmar', { barberia: barbId, turno: turno.id }),
        cortesIndexUrl: route('owner.barberias.cortes.index', barbId),
        onRefresh: () => router.reload({ only: ['turnos'], preserveScroll: true }),
    });

    function handleBarberoChange(event) {
        const value = event.target.value;
        router.get(
            indexUrl,
            { day: dia, ...(value ? { barbero_id: value } : {}) },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <AuthenticatedLayout
            headerClassName="bg-brand-bg"
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
            header={(
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="font-display text-3xl font-bold tracking-[-0.04em] text-brand-text sm:text-4xl">
                            Turnos
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">
                            Agenda del día: cargá turnos coordinados por WhatsApp o teléfono y marcá su estado a medida que pasan.
                        </p>
                    </div>

                    <Link
                        href={route('owner.barberias.turnos.configuracion.index', barbId)}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-brand-border bg-brand-surface-alt px-5 text-sm font-semibold text-brand-text-secondary transition hover:border-brand-primary/20 hover:bg-brand-primary/5 hover:text-brand-text"
                    >
                        <IconSettings size={17} stroke={1.9} />
                        Configuración
                    </Link>
                </div>
            )}
        >
            <Head title="Turnos" />

            <div className="pb-12">
                <div className="mx-auto max-w-[1720px] space-y-8 px-2 sm:px-3 lg:px-4">
                    <PublicLinkBanner url={publicTurnoUrl} />

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-brand-border bg-brand-surface p-4 shadow-brand-card sm:p-5">
                        <DaySelector date={dia} esHoy={esHoy} url={indexUrl} onDark={false} />

                        <div className="flex flex-wrap items-center gap-3">
                            <SelectInput
                                value={barberoFiltro ?? ''}
                                onChange={handleBarberoChange}
                                className="min-h-[44px] rounded-full text-sm"
                            >
                                <option value="">Todos los barberos</option>
                                {barberos.map((barbero) => (
                                    <option key={barbero.id} value={barbero.id}>{barbero.name}</option>
                                ))}
                            </SelectInput>

                            <button
                                type="button"
                                onClick={() => setModalOpen(true)}
                                disabled={faltaCatalogo}
                                title={faltaCatalogo ? 'Necesitás al menos un barbero y un servicio activos para cargar un turno' : undefined}
                                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-brand-primary px-5 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <IconCalendarPlus size={18} stroke={1.9} />
                                Carga manual
                            </button>
                        </div>
                    </div>

                    {turnos.length === 0 ? (
                        <div className="rounded-[28px] border border-dashed border-brand-border bg-brand-surface-alt p-10 text-center shadow-brand-card">
                            <h4 className="font-display text-xl font-bold text-brand-text">
                                Sin turnos para este día
                            </h4>
                            <p className="mx-auto mt-3 max-w-xl text-sm text-brand-text-secondary">
                                Usá "Carga manual" para agendar un turno coordinado por WhatsApp o teléfono.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                            {turnos.map((turno) => (
                                <TurnoListItem
                                    key={turno.id}
                                    turno={turno}
                                    showBarbero={!barberoFiltro}
                                    onStatusChange={onStatusChange}
                                    onConfirm={onConfirm}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {!faltaCatalogo && (
                <CargaManualModal
                    show={modalOpen}
                    onClose={() => setModalOpen(false)}
                    barberiaId={barbId}
                    servicios={servicios}
                    barberos={barberos}
                    fechaInicial={dia}
                />
            )}

            <SugerenciaClienteModal sugerencia={sugerencia} onConfirm={confirmarSugerencia} />
        </AuthenticatedLayout>
    );
}
