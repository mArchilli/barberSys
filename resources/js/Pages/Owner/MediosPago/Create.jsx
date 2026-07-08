import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { IconChevronLeft, IconCreditCard } from '@tabler/icons-react';

export default function Create() {
    const { currentBarberia } = usePage().props;
    const barbId = currentBarberia?.id;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('owner.barberias.medios-pago.store', { barberia: barbId }));
    }

    return (
        <AuthenticatedLayout
            headerClassName="bg-brand-bg"
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
            header={(
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-medium text-brand-text-secondary">
                            Catalogo operativo
                        </p>
                        <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-brand-text sm:text-4xl">
                            Nuevo medio de pago
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">
                            Agrega una nueva forma de cobro para que quede disponible al registrar ingresos en la barberia.
                        </p>
                    </div>

                    <Link
                        href={route('owner.barberias.medios-pago.index', { barberia: barbId })}
                        className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-brand-text-secondary transition hover:text-brand-text"
                    >
                        <IconChevronLeft size={18} stroke={2} />
                        Volver a medios de pago
                    </Link>
                </div>
            )}
        >
            <Head title="Nuevo medio de pago" />

            <div className="pb-12">
                <div className="mx-auto max-w-[1720px] space-y-8 px-2 sm:px-3 lg:px-4">
                    <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-start gap-4">
                                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-brand-primary/12 text-brand-primary shadow-sm">
                                    <IconCreditCard size={30} stroke={1.8} />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-brand-text-secondary">
                                        Alta de medio
                                    </p>
                                    <p className="mt-3 truncate font-display text-4xl font-extrabold tracking-[-0.04em] text-brand-text sm:text-[3.25rem]">
                                        {data.name || 'Sin nombre'}
                                    </p>
                                    <p className="mt-2 text-sm text-brand-text-secondary">
                                        Completa el nombre para sumarlo al catalogo operativo de cobros de la barberia.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submit} className="mt-8 space-y-6">
                            <div className="rounded-[24px] bg-brand-surface-alt p-5">
                                <InputLabel htmlFor="name" value="Nombre *" />
                                <TextInput
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-2 block w-full rounded-full border-brand-border bg-brand-surface px-4 py-3.5"
                                    autoFocus
                                    placeholder="Ej: Efectivo, Transferencia, Tarjeta"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="rounded-[24px] bg-brand-surface-alt px-5 py-4 text-sm text-brand-text-secondary">
                                Tip: usa nombres claros y cortos para que el equipo identifique rapido cada forma de cobro.
                            </div>

                            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                                <Link
                                    href={route('owner.barberias.medios-pago.index', { barberia: barbId })}
                                    className="flex min-h-[44px] items-center justify-center text-sm text-brand-text-secondary hover:text-brand-text sm:min-h-0"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-brand-primary px-6 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    Crear medio de pago
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
