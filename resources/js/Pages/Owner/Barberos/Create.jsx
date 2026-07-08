import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { IconChevronLeft, IconUsers } from '@tabler/icons-react';

function formatMoney(value) {
    const amount = value === '' ? 0 : Number(value);

    return `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Create({ canAdd }) {
    const { currentBarberia } = usePage().props;
    const barbId = currentBarberia?.id;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        salary_type: 'fixed',
        salary_amount: '',
        commission_pct: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('owner.barberias.barberos.store', { barberia: barbId }));
    }

    return (
        <AuthenticatedLayout
            headerClassName="bg-brand-bg"
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
            header={(
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-medium text-brand-text-secondary">
                            Gestion del equipo
                        </p>
                        <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-brand-text sm:text-4xl">
                            Nuevo barbero
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">
                            Crea un nuevo perfil para sumarlo al equipo y define desde el inicio como se va a liquidar su trabajo.
                        </p>
                    </div>

                    <Link
                        href={route('owner.barberias.barberos.index', { barberia: barbId })}
                        className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-brand-text-secondary transition hover:text-brand-text"
                    >
                        <IconChevronLeft size={18} stroke={2} />
                        Volver a barberos
                    </Link>
                </div>
            )}
        >
            <Head title="Nuevo barbero" />

            <div className="pb-12">
                <div className="mx-auto max-w-[1720px] space-y-8 px-2 sm:px-3 lg:px-4">
                    <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-start gap-4">
                                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-brand-primary/12 text-brand-primary shadow-sm">
                                    <IconUsers size={30} stroke={1.8} />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-brand-text-secondary">
                                        Alta de barbero
                                    </p>
                                    <p className="mt-3 truncate font-display text-4xl font-extrabold tracking-[-0.04em] text-brand-text sm:text-[3.25rem]">
                                        {data.name || 'Sin nombre'}
                                    </p>
                                    <p className="mt-2 text-sm text-brand-text-secondary">
                                        Completa los datos principales y deja listo su esquema de sueldo para empezar a operar.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submit} className="mt-8 space-y-6">
                            {!canAdd && (
                                <div className="rounded-[24px] border border-brand-danger/20 bg-brand-danger/5 px-5 py-4 text-sm text-brand-danger">
                                    Alcanzaste el limite de barberos de tu plan. Actualiza tu plan para agregar mas.
                                </div>
                            )}

                            {errors.plan_limit && (
                                <div className="rounded-[24px] border border-brand-danger/20 bg-brand-danger/5 px-5 py-4 text-sm text-brand-danger">
                                    {errors.plan_limit}
                                </div>
                            )}

                            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)]">
                                <div className="space-y-6">
                                    <div className="rounded-[24px] bg-brand-surface-alt p-5">
                                        <InputLabel htmlFor="name" value="Nombre completo *" />
                                        <TextInput
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="mt-2 block w-full rounded-full border-brand-border bg-brand-surface px-4 py-3.5"
                                            autoFocus
                                            placeholder="Ej: Juan Perez"
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>

                                    <div className="rounded-[24px] bg-brand-surface-alt p-5">
                                        <InputLabel htmlFor="email" value="Email *" />
                                        <TextInput
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="mt-2 block w-full rounded-full border-brand-border bg-brand-surface px-4 py-3.5"
                                            placeholder="barbero@ejemplo.com"
                                        />
                                        <InputError message={errors.email} className="mt-2" />
                                    </div>

                                    <div className="rounded-[24px] bg-brand-surface-alt p-5">
                                        <InputLabel htmlFor="phone" value="Telefono" />
                                        <TextInput
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="mt-2 block w-full rounded-full border-brand-border bg-brand-surface px-4 py-3.5"
                                            placeholder="Opcional"
                                        />
                                        <InputError message={errors.phone} className="mt-2" />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="rounded-[24px] bg-brand-surface-alt p-5">
                                        <fieldset>
                                            <legend className="text-sm font-medium text-brand-text">
                                                Tipo de sueldo *
                                            </legend>
                                            <div className="mt-4 grid gap-3">
                                                <label className={`flex cursor-pointer items-start gap-3 rounded-[20px] border px-4 py-4 transition ${
                                                    data.salary_type === 'fixed'
                                                        ? 'border-brand-primary/25 bg-brand-surface text-brand-text shadow-sm'
                                                        : 'border-brand-border bg-brand-surface text-brand-text-secondary'
                                                }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="salary_type"
                                                        value="fixed"
                                                        checked={data.salary_type === 'fixed'}
                                                        onChange={() => setData('salary_type', 'fixed')}
                                                        className="mt-1 text-brand-primary focus:ring-brand-primary"
                                                    />
                                                    <span className="block">
                                                        <span className="block text-sm font-semibold text-brand-text">Sueldo fijo</span>
                                                        <span className="mt-1 block text-xs text-brand-text-secondary">
                                                            Ideal si quieres un monto mensual definido.
                                                        </span>
                                                    </span>
                                                </label>

                                                <label className={`flex cursor-pointer items-start gap-3 rounded-[20px] border px-4 py-4 transition ${
                                                    data.salary_type === 'commission'
                                                        ? 'border-brand-primary/25 bg-brand-surface text-brand-text shadow-sm'
                                                        : 'border-brand-border bg-brand-surface text-brand-text-secondary'
                                                }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="salary_type"
                                                        value="commission"
                                                        checked={data.salary_type === 'commission'}
                                                        onChange={() => setData('salary_type', 'commission')}
                                                        className="mt-1 text-brand-primary focus:ring-brand-primary"
                                                    />
                                                    <span className="block">
                                                        <span className="block text-sm font-semibold text-brand-text">Comision</span>
                                                        <span className="mt-1 block text-xs text-brand-text-secondary">
                                                            El pago se calcula segun el porcentaje acordado.
                                                        </span>
                                                    </span>
                                                </label>
                                            </div>
                                            <InputError message={errors.salary_type} className="mt-2" />
                                        </fieldset>
                                    </div>

                                    {data.salary_type === 'fixed' && (
                                        <div className="rounded-[24px] bg-brand-surface-alt p-5">
                                            <InputLabel htmlFor="salary_amount" value="Monto fijo mensual ($) *" />
                                            <TextInput
                                                id="salary_amount"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.salary_amount}
                                                onChange={(e) => setData('salary_amount', e.target.value)}
                                                className="mt-2 block w-full rounded-full border-brand-border bg-brand-surface px-4 py-3.5"
                                                placeholder="0.00"
                                            />
                                            <InputError message={errors.salary_amount} className="mt-2" />
                                        </div>
                                    )}

                                    {data.salary_type === 'commission' && (
                                        <div className="rounded-[24px] bg-brand-surface-alt p-5">
                                            <InputLabel htmlFor="commission_pct" value="Porcentaje de comision (%) *" />
                                            <TextInput
                                                id="commission_pct"
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={data.commission_pct}
                                                onChange={(e) => setData('commission_pct', e.target.value)}
                                                className="mt-2 block w-full rounded-full border-brand-border bg-brand-surface px-4 py-3.5"
                                                placeholder="0.00"
                                            />
                                            <InputError message={errors.commission_pct} className="mt-2" />
                                        </div>
                                    )}

                                    <div className="rounded-[24px] bg-brand-surface-alt px-5 py-5">
                                        <p className="text-sm font-medium text-brand-text-secondary">
                                            Resumen inicial
                                        </p>
                                        <p className="mt-3 truncate font-display text-2xl font-bold tracking-[-0.04em] text-brand-text">
                                            {data.name || 'Nuevo barbero'}
                                        </p>
                                        <div className="mt-4 rounded-[20px] bg-brand-surface px-4 py-4">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                                Liquidacion
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-brand-text">
                                                {data.salary_type === 'fixed'
                                                    ? `Sueldo fijo por ${formatMoney(data.salary_amount)}`
                                                    : `${data.commission_pct || '0'}% de comision`}
                                            </p>
                                        </div>
                                        <p className="mt-4 text-sm text-brand-text-secondary">
                                            Al crear este perfil se generara una contrasena temporal para el primer acceso.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                                <Link
                                    href={route('owner.barberias.barberos.index', { barberia: barbId })}
                                    className="flex min-h-[44px] items-center justify-center text-sm text-brand-text-secondary hover:text-brand-text sm:min-h-0"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing || !canAdd}
                                    className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-brand-primary px-6 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    Crear barbero
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
