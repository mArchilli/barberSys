import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { IconChevronLeft, IconList, IconSparkles } from '@tabler/icons-react';

function formatMoney(value) {
    const amount = value === '' ? 0 : Number(value);

    return `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Create() {
    const { currentBarberia } = usePage().props;
    const barbId = currentBarberia?.id;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        price: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('owner.barberias.servicios.store', { barberia: barbId }));
    }

    return (
        <AuthenticatedLayout
            headerClassName="bg-brand-bg"
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
            header={(
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-medium text-brand-text-secondary">
                            Catalogo de la barberia
                        </p>
                        <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-brand-text sm:text-4xl">
                            Nuevo servicio
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">
                            Agrega un nuevo servicio con su precio para que quede disponible al momento de registrar cortes.
                        </p>
                    </div>

                    <Link
                        href={route('owner.barberias.servicios.index', { barberia: barbId })}
                        className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-brand-text-secondary transition hover:text-brand-text"
                    >
                        <IconChevronLeft size={18} stroke={2} />
                        Volver a servicios
                    </Link>
                </div>
            )}
        >
            <Head title="Nuevo servicio" />

            <div className="pb-12">
                <div className="mx-auto max-w-[1720px] space-y-8 px-2 sm:px-3 lg:px-4">
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)]">
                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex min-w-0 items-start gap-4">
                                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-brand-primary/12 text-brand-primary shadow-sm">
                                        <IconList size={30} stroke={1.8} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-brand-text-secondary">
                                            Alta de servicio
                                        </p>
                                        <p className="mt-3 truncate font-display text-4xl font-extrabold tracking-[-0.04em] text-brand-text sm:text-[3.25rem]">
                                            {data.name || 'Sin nombre'}
                                        </p>
                                        <p className="mt-2 text-sm text-brand-text-secondary">
                                            Completa los datos del servicio para sumarlo al catalogo operativo de la barberia.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={submit} className="mt-8 space-y-6">
                                <div className="rounded-[24px] bg-brand-surface-alt p-5">
                                    <InputLabel htmlFor="name" value="Nombre del servicio *" />
                                    <TextInput
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-2 block w-full rounded-full border-brand-border bg-brand-surface px-4 py-3.5"
                                        autoFocus
                                        placeholder="Ej: Corte clasico"
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div className="rounded-[24px] bg-brand-surface-alt p-5">
                                    <InputLabel htmlFor="price" value="Precio ($) *" />
                                    <TextInput
                                        id="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        className="mt-2 block w-full rounded-full border-brand-border bg-brand-surface px-4 py-3.5"
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.price} className="mt-2" />
                                </div>

                                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                                    <Link
                                        href={route('owner.barberias.servicios.index', { barberia: barbId })}
                                        className="flex min-h-[44px] items-center justify-center text-sm text-brand-text-secondary hover:text-brand-text sm:min-h-0"
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-brand-primary px-6 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                    >
                                        Crear servicio
                                    </button>
                                </div>
                            </form>
                        </section>

                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-brand-text-secondary">
                                        Vista previa
                                    </p>
                                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-brand-text">
                                        Asi se vera en tu catalogo
                                    </h3>
                                    <p className="mt-2 text-xs text-brand-text-secondary">
                                        Una referencia rapida para validar nombre y precio antes de guardar.
                                    </p>
                                </div>
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-link shadow-sm">
                                    <IconSparkles size={22} stroke={1.8} />
                                </span>
                            </div>

                            <div className="mt-6 rounded-[24px] border border-brand-border bg-brand-surface-alt p-5">
                                <p className="text-sm font-medium text-brand-text-secondary">
                                    Servicio
                                </p>
                                <h4 className="mt-2 truncate font-display text-2xl font-bold tracking-[-0.04em] text-brand-text">
                                    {data.name || 'Nuevo servicio'}
                                </h4>

                                <div className="mt-5 rounded-[22px] bg-brand-surface px-4 py-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                        Precio inicial
                                    </p>
                                    <p className="mt-2 font-display text-3xl font-extrabold tracking-[-0.04em] text-brand-text">
                                        {formatMoney(data.price)}
                                    </p>
                                </div>

                                <p className="mt-4 text-sm text-brand-text-secondary">
                                    Al crear este servicio quedara activo y disponible para nuevos cortes.
                                </p>
                            </div>

                            <div className="mt-4 rounded-[24px] bg-brand-surface-alt px-5 py-4 text-sm text-brand-text-secondary">
                                Tip: usa nombres cortos y claros para que el equipo los encuentre rapido al cargar un corte.
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
