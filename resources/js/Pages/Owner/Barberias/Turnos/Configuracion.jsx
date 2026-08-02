import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BarberoDisponibilidadCard from '@/Pages/Owner/Barberias/Turnos/Partials/BarberoDisponibilidadCard';
import ExcepcionesCard from '@/Pages/Owner/Barberias/Turnos/Partials/ExcepcionesCard';
import HorariosAtencionCard from '@/Pages/Owner/Barberias/Turnos/Partials/HorariosAtencionCard';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { IconChevronLeft } from '@tabler/icons-react';

export default function Configuracion({ configuracion, horarios, excepciones, barberos }) {
    const { flash, currentBarberia } = usePage().props;
    const barbId = currentBarberia?.id;

    const { data, setData, patch, processing, errors } = useForm({
        turnos_enabled: configuracion.turnos_enabled,
        public_slug: configuracion.public_slug ?? '',
        whatsapp_number: configuracion.whatsapp_number ?? '',
    });

    function submitGeneral(e) {
        e.preventDefault();
        patch(route('owner.barberias.turnos.configuracion.update', { barberia: barbId }));
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
                            Configurá si esta barbería toma turnos, su horario de atención y la disponibilidad de cada barbero.
                        </p>
                    </div>

                    <Link
                        href={route('owner.barberias.turnos.index', barbId)}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-brand-border bg-brand-surface-alt px-5 text-sm font-semibold text-brand-text-secondary transition hover:border-brand-primary/20 hover:bg-brand-primary/5 hover:text-brand-text"
                    >
                        <IconChevronLeft size={18} stroke={2} />
                        Volver a turnos
                    </Link>
                </div>
            )}
        >
            <Head title="Configuración de turnos" />

            <div className="pb-12">
                <div className="mx-auto max-w-[1720px] space-y-8 px-2 sm:px-3 lg:px-4">
                    {flash?.success && (
                        <div className="rounded-[24px] border border-brand-success/20 bg-brand-success-soft px-5 py-4 text-sm text-brand-success shadow-brand-card">
                            {flash.success}
                        </div>
                    )}

                    {flash?.warning && (
                        <div className="rounded-[24px] border border-brand-warning/20 bg-brand-warning-soft px-5 py-4 text-sm text-brand-warning shadow-brand-card">
                            {flash.warning}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <h3 className="font-display text-lg font-bold text-brand-text">Turnos online</h3>
                            <p className="mt-1 text-sm text-brand-text-secondary">
                                Activá los turnos para esta barbería y configurá los datos de contacto público.
                            </p>

                            <form onSubmit={submitGeneral} className="mt-6 space-y-5">
                                <label className="flex cursor-pointer items-center gap-3">
                                    <Checkbox
                                        checked={data.turnos_enabled}
                                        onChange={(e) => setData('turnos_enabled', e.target.checked)}
                                    />
                                    <span className="text-sm font-medium text-brand-text">Activar turnos para esta barbería</span>
                                </label>
                                <InputError message={errors.turnos_enabled} className="mt-1" />

                                <div>
                                    <InputLabel htmlFor="public_slug" value="Slug público" />
                                    <TextInput
                                        id="public_slug"
                                        value={data.public_slug}
                                        onChange={(e) => setData(
                                            'public_slug',
                                            e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
                                        )}
                                        placeholder="ej: barberia-centro"
                                        className="mt-2 block min-h-[48px] w-full rounded-full border-brand-border bg-brand-surface px-4 text-sm"
                                    />
                                    <InputError message={errors.public_slug} className="mt-1" />
                                    <p className="mt-1 text-xs text-brand-text-secondary">
                                        Va a formar parte del link público de reserva. Una vez que actives turnos y guardes el slug, vas a encontrar el link listo para copiar en Turnos y en el Dashboard.
                                    </p>
                                </div>

                                <div>
                                    <InputLabel htmlFor="whatsapp_number" value="WhatsApp de contacto" />
                                    <TextInput
                                        id="whatsapp_number"
                                        value={data.whatsapp_number}
                                        onChange={(e) => setData('whatsapp_number', e.target.value)}
                                        placeholder="ej: 5491122334455"
                                        className="mt-2 block min-h-[48px] w-full rounded-full border-brand-border bg-brand-surface px-4 text-sm"
                                    />
                                    <InputError message={errors.whatsapp_number} className="mt-1" />
                                </div>

                                <div className="flex justify-end pt-2">
                                    <PrimaryButton disabled={processing}>Guardar</PrimaryButton>
                                </div>
                            </form>
                        </section>

                        <HorariosAtencionCard horarios={horarios} barbId={barbId} />

                        <ExcepcionesCard excepciones={excepciones} barbId={barbId} />
                    </div>

                    <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                        <h3 className="font-display text-lg font-bold text-brand-text">Disponibilidad de barberos</h3>
                        <p className="mt-1 text-sm text-brand-text-secondary">
                            Cargá el horario semanal de cada barbero. No puede exceder el horario de atención general de la barbería.
                        </p>

                        {barberos.length === 0 ? (
                            <p className="mt-6 text-sm text-brand-text-secondary">
                                Todavía no tenés barberos activos cargados en esta barbería.
                            </p>
                        ) : (
                            <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                                {barberos.map((barbero) => (
                                    <BarberoDisponibilidadCard
                                        key={barbero.id}
                                        barbero={barbero}
                                        horarios={horarios}
                                        barbId={barbId}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
