import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import TourRestartButton from '@/Components/TourRestartButton';
import usePageTour from '@/Hooks/usePageTour';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    IconAlertTriangle,
    IconArrowUpRight,
    IconClockHour4,
    IconCreditCard,
    IconFileInvoice,
    IconRosetteDiscountCheck,
    IconTicket,
} from '@tabler/icons-react';
import { useState } from 'react';

const formatARS = (value) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(value);

const formatDateLong = (isoDate) =>
    new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${isoDate}T00:00:00`));

const STATUS_BADGES = {
    trial: { label: 'En prueba', className: 'bg-brand-warning-soft text-brand-warning' },
    active: { label: 'Activa', className: 'bg-brand-primary text-brand-on-primary' },
    past_due: { label: 'Pago pendiente', className: 'bg-brand-danger-soft text-brand-danger' },
    cancelled: { label: 'Cancelada', className: 'bg-brand-surface-alt text-brand-text-secondary' },
};

const PAYMENT_STATUS = {
    approved: { label: 'Aprobado', className: 'bg-brand-success-soft text-brand-success' },
    rejected: { label: 'Rechazado', className: 'bg-brand-danger-soft text-brand-danger' },
};

function PaymentStatusBadge({ status }) {
    const badge = PAYMENT_STATUS[status] ?? {
        label: 'Pendiente',
        className: 'bg-brand-warning-soft text-brand-warning',
    };

    return (
        <span className={`inline-flex rounded-brand-pill px-3 py-1 text-xs font-semibold ${badge.className}`}>
            {badge.label}
        </span>
    );
}

/**
 * Contexto de estado junto al botón de activación: días de trial restantes
 * (mismo umbral de tono que TrialBanner — informativo con más de 5 días,
 * urgente con 5 o menos) o, si la suscripción ya no está en trial, el estado
 * real (ej. pago pendiente). El botón en sí NUNCA depende de este umbral —
 * solo cambia el tono visual del texto que lo acompaña.
 */
function ActivationStatusContext({ subscription, statusBadge }) {
    if (subscription.status === 'trial' && subscription.trial_days_left !== null) {
        const days = subscription.trial_days_left;
        const urgent = days <= 5;
        const message =
            days === 0
                ? 'Tu período de prueba termina hoy.'
                : days === 1
                  ? 'Tu período de prueba termina mañana.'
                  : `Te quedan ${days} días de prueba.`;

        return (
            <span
                className={`inline-flex items-center gap-1.5 rounded-brand-pill px-3 py-1.5 text-xs font-semibold ${
                    urgent ? 'bg-brand-warning-soft text-brand-warning' : 'bg-brand-primary-soft text-brand-primary-soft-text'
                }`}
            >
                {urgent ? <IconAlertTriangle size={14} stroke={2} /> : <IconClockHour4 size={14} stroke={2} />}
                {message}
            </span>
        );
    }

    return (
        <span className={`inline-flex rounded-brand-pill px-3 py-1.5 text-xs font-semibold ${statusBadge.className}`}>
            {statusBadge.label}
        </span>
    );
}

/**
 * Estado de la factura tal como lo ve el owner. La autorización de AFIP es
 * asíncrona: mientras esté 'solicitado' la factura NO está lista — nunca se
 * muestra como "lista" ni con descarga hasta 'autorizado'.
 */
function InvoiceCell({ payment }) {
    if (payment.invoice_status === 'autorizado') {
        return (
            <span
                className="font-medium text-brand-success"
                title={payment.cae ? `CAE ${payment.cae}` : undefined}
            >
                Autorizada
            </span>
        );
    }

    if (payment.invoice_status === 'solicitado') {
        return <span className="text-brand-text-secondary">Factura en proceso</span>;
    }

    return <span className="text-brand-text-secondary">—</span>;
}

const SUSCRIPCION_TOUR_STEPS = [
    {
        element: '[data-tour="owner-suscripcion-plan"]',
        popover: {
            title: 'Tu plan actual',
            description: 'El plan contratado y el estado de tu suscripción: en prueba, activa, con pago pendiente o cancelada.',
        },
    },
    {
        element: '[data-tour="owner-suscripcion-activar"]',
        popover: {
            title: 'Activar tu suscripción',
            description: 'Este botón está siempre disponible mientras estés en período de prueba, sin importar cuántos días te queden — a diferencia del aviso del resto del panel, acá podés activar cuando quieras.',
        },
    },
    {
        element: '[data-tour="owner-suscripcion-ciclo"]',
        popover: {
            title: 'Mensual o anual',
            description: 'El anual no son 12 cuotas reducidas: es un único cobro por el total del año, con un ahorro respecto de pagar mes a mes.',
        },
    },
    {
        element: '[data-tour="owner-suscripcion-pagos"]',
        popover: {
            title: 'Historial de pagos',
            description: 'Los últimos cobros de tu suscripción, con su estado y su factura correspondiente.',
        },
    },
    {
        // La columna "Factura" solo se muestra desde md (md:table-cell) — en
        // mobile el <th> existe en el DOM pero con tamaño cero, así que se
        // resuelve dinámicamente para dejar que skipMissingElement salte
        // este paso ahí en vez de resaltar un elemento invisible.
        element: () => {
            const th = document.querySelector('[data-tour="owner-suscripcion-factura"]');
            return th && th.offsetParent !== null ? th : null;
        },
        popover: {
            title: '"Factura en proceso" vs. autorizada',
            description: 'Emitir una factura es asincrónico contra AFIP: mientras dice "Factura en proceso" todavía no tiene CAE. No significa que algo falló — solo hay que esperar a que se autorice.',
        },
    },
    {
        element: '[data-tour="owner-suscripcion-upgrade"]',
        popover: {
            title: 'Cambiar de plan',
            description: 'Si tu barbería crece, podés pasar a un plan con más límite desde acá, sin perder tu historial ni tus datos.',
        },
    },
];

export default function Index({ subscription, billing, payments, availablePlans, currentUsage, mpConfigured }) {
    const { flash, errors: pageErrors } = usePage().props;
    const [planToConfirm, setPlanToConfirm] = useState(null);
    const [changingPlan, setChangingPlan] = useState(false);
    const { startTour } = usePageTour('owner_suscripcion', SUSCRIPCION_TOUR_STEPS);

    const { data, setData, post, processing, errors } = useForm({
        razon_social: billing.razon_social ?? '',
        cuit: billing.cuit ?? '',
        billing_cycle: 'monthly',
    });

    const statusBadge = STATUS_BADGES[subscription.status] ?? STATUS_BADGES.trial;
    const hasDiscount = subscription.coupon && subscription.charge_amount < subscription.list_price;
    const hasAnnualOption = subscription.pricing.annual !== null;
    const annualSavingsPerYear = hasAnnualOption
        ? Math.max(0, (subscription.pricing.monthly - subscription.pricing.annual) * 12)
        : 0;
    const isAnnual = subscription.billing_cycle === 'annual';

    const submitActivation = (event) => {
        event.preventDefault();
        post(route('owner.suscripcion.activate'));
    };

    const confirmPlanChange = () => {
        if (!planToConfirm) return;
        setChangingPlan(true);
        router.post(
            route('owner.suscripcion.upgrade'),
            { plan_id: planToConfirm.id },
            {
                onFinish: () => {
                    setChangingPlan(false);
                    setPlanToConfirm(null);
                },
            },
        );
    };

    return (
        <AuthenticatedLayout
            headerClassName="bg-brand-bg"
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
            header={(
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-brand-text sm:text-4xl">
                            Mi suscripción
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">
                            Tu plan, el débito automático y las facturas de Pelito, todo en un solo lugar.
                        </p>
                    </div>

                    <TourRestartButton onClick={startTour} className="self-start" />
                </div>
            )}
        >
            <Head title="Mi suscripción" />

            <div className="pb-12">
                <div className="mx-auto max-w-[1720px] space-y-8 px-2 sm:px-3 lg:px-4">
                    {flash?.success && (
                        <div className="rounded-[24px] border border-brand-success/20 bg-brand-success-soft px-5 py-4 text-sm text-brand-success shadow-brand-card">
                            {flash.success}
                        </div>
                    )}

                    {(pageErrors?.mercadopago || pageErrors?.plan_id) && (
                        <div className="rounded-[24px] border border-brand-danger/20 bg-brand-danger-soft px-5 py-4 text-sm text-brand-danger shadow-brand-card">
                            {pageErrors.mercadopago || pageErrors.plan_id}
                        </div>
                    )}

                    {/* Hero: plan actual */}
                    <section data-tour="owner-suscripcion-plan" className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-brand-text-secondary">Plan actual</p>
                                <div className="mt-2 flex flex-wrap items-center gap-3">
                                    <h3 className="font-display text-3xl font-bold tracking-[-0.04em] text-brand-text">
                                        {subscription.plan_name}
                                    </h3>
                                    <span className={`rounded-brand-pill px-3 py-1 text-xs font-semibold ${statusBadge.className}`}>
                                        {statusBadge.label}
                                    </span>
                                </div>

                                {subscription.status === 'trial' && subscription.trial_days_left !== null && (
                                    <p className="mt-3 text-sm text-brand-text-secondary">
                                        {subscription.trial_days_left === 0
                                            ? 'Tu período de prueba termina hoy.'
                                            : `Te quedan ${subscription.trial_days_left} día${subscription.trial_days_left === 1 ? '' : 's'} de prueba.`}
                                    </p>
                                )}

                                {subscription.status === 'active' && subscription.next_payment_date && (
                                    <p className="mt-3 text-sm text-brand-text-secondary">
                                        Vigente hasta el {formatDateLong(subscription.next_payment_date)} — ese día se
                                        cobra automáticamente {isAnnual ? 'el próximo año' : 'el próximo mes'}, sin que
                                        tengas que hacer nada.
                                    </p>
                                )}
                            </div>

                            <div className="rounded-[22px] bg-brand-surface-alt px-5 py-4 lg:text-right">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                    {isAnnual ? 'Costo anual' : 'Costo mensual'}
                                </p>
                                <div className="mt-2 flex items-baseline gap-2 lg:justify-end">
                                    <p className="font-display text-3xl font-extrabold tracking-[-0.04em] text-brand-text">
                                        {formatARS(subscription.charge_amount)}
                                    </p>
                                    {hasDiscount && (
                                        <p className="text-sm font-medium text-brand-text-secondary line-through">
                                            {formatARS(isAnnual ? subscription.list_price * 12 : subscription.list_price)}
                                        </p>
                                    )}
                                </div>
                                {isAnnual && (
                                    <p className="mt-1 text-xs text-brand-text-secondary">
                                        Equivale a {formatARS(subscription.list_price)}/mes — se cobra una vez al año.
                                    </p>
                                )}
                                {hasDiscount && (
                                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-brand-pill bg-brand-primary-soft px-3 py-1 text-xs font-semibold text-brand-primary-soft-text">
                                        <IconTicket size={14} stroke={2} />
                                        Cupón {subscription.coupon.code}
                                        {subscription.coupon.duration_months
                                            ? ` · primeros ${subscription.coupon.duration_months} meses`
                                            : ''}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)]">
                        {/* Activación del débito automático */}
                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start gap-3">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-link shadow-sm">
                                    <IconCreditCard size={22} stroke={1.8} />
                                </span>
                                <div>
                                    <h3 className="text-xl font-semibold tracking-[-0.03em] text-brand-text">
                                        Débito automático
                                    </h3>
                                    <p className="mt-1 text-sm text-brand-text-secondary">
                                        {subscription.has_preapproval
                                            ? 'Tu suscripción se cobra todos los meses vía MercadoPago.'
                                            : 'Autorizá el cobro mensual con MercadoPago para que tu cuenta siga activa después de la prueba.'}
                                    </p>
                                </div>
                            </div>

                            {subscription.has_preapproval ? (
                                <div className="mt-6 flex items-start gap-2.5 rounded-[22px] bg-brand-success-soft px-4 py-4 text-sm text-brand-success">
                                    <IconRosetteDiscountCheck size={18} stroke={2} className="mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-semibold">Débito automático activado</p>
                                        <p className="mt-0.5 font-normal">
                                            No tenés que hacer nada más — MercadoPago te cobra solo, todos los meses, hasta que canceles.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={submitActivation} className="mt-6 space-y-5">
                                    <div>
                                        <p className="text-sm font-semibold text-brand-text">Ciclo de cobro</p>
                                        <div data-tour="owner-suscripcion-ciclo" className="mt-2 grid gap-3 sm:grid-cols-2">
                                            <label
                                                className={`flex cursor-pointer flex-col rounded-[18px] border px-4 py-3 transition ${
                                                    data.billing_cycle === 'monthly'
                                                        ? 'border-brand-primary bg-brand-primary/5'
                                                        : 'border-brand-border bg-brand-surface-alt'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="billing_cycle"
                                                        value="monthly"
                                                        checked={data.billing_cycle === 'monthly'}
                                                        onChange={() => setData('billing_cycle', 'monthly')}
                                                    />
                                                    <span className="text-sm font-semibold text-brand-text">Mensual</span>
                                                </span>
                                                <span className="mt-1 text-sm text-brand-text-secondary">
                                                    {formatARS(subscription.pricing.monthly)}/mes
                                                </span>
                                            </label>

                                            <label
                                                className={`flex flex-col rounded-[18px] border px-4 py-3 transition ${
                                                    !hasAnnualOption
                                                        ? 'cursor-not-allowed border-brand-border bg-brand-surface-alt opacity-50'
                                                        : data.billing_cycle === 'annual'
                                                          ? 'cursor-pointer border-brand-primary bg-brand-primary/5'
                                                          : 'cursor-pointer border-brand-border bg-brand-surface-alt'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="billing_cycle"
                                                        value="annual"
                                                        checked={data.billing_cycle === 'annual'}
                                                        disabled={!hasAnnualOption}
                                                        onChange={() => setData('billing_cycle', 'annual')}
                                                    />
                                                    <span className="text-sm font-semibold text-brand-text">Anual</span>
                                                </span>
                                                {hasAnnualOption ? (
                                                    <>
                                                        <span className="mt-1 text-sm text-brand-text-secondary">
                                                            {formatARS(subscription.pricing.annual)}/mes — un único cargo de{' '}
                                                            {formatARS(subscription.pricing.annual * 12)} por año
                                                        </span>
                                                        <span className="mt-1 inline-flex w-fit items-center rounded-brand-pill bg-brand-success-soft px-2.5 py-0.5 text-xs font-semibold text-brand-success">
                                                            Ahorrás {formatARS(annualSavingsPerYear)} al año
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="mt-1 text-sm text-brand-text-secondary">No disponible para este plan</span>
                                                )}
                                            </label>
                                        </div>
                                        <InputError message={errors.billing_cycle} className="mt-2" />
                                    </div>

                                    <div className="rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                        <p className="text-sm font-semibold text-brand-text">
                                            Datos para tu factura <span className="font-normal text-brand-text-secondary">(opcional)</span>
                                        </p>
                                        <p className="mt-1 text-xs text-brand-text-secondary">
                                            Si los dejás vacíos, la factura sale a tu nombre como consumidor final.
                                        </p>

                                        <div className="mt-4 space-y-4">
                                            <div>
                                                <InputLabel htmlFor="razon_social" value="Nombre o razón social para la factura" />
                                                <TextInput
                                                    id="razon_social"
                                                    className="mt-1 block w-full"
                                                    value={data.razon_social}
                                                    onChange={(e) => setData('razon_social', e.target.value)}
                                                    autoComplete="organization"
                                                />
                                                <InputError message={errors.razon_social} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="cuit" value="CUIT o DNI" />
                                                <TextInput
                                                    id="cuit"
                                                    className="mt-1 block w-full"
                                                    value={data.cuit}
                                                    onChange={(e) => setData('cuit', e.target.value)}
                                                    inputMode="numeric"
                                                    placeholder="20-12345678-3"
                                                />
                                                <InputError message={errors.cuit} className="mt-2" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <ActivationStatusContext subscription={subscription} statusBadge={statusBadge} />

                                        <button
                                            type="submit"
                                            data-tour="owner-suscripcion-activar"
                                            disabled={processing || !mpConfigured}
                                            className={`inline-flex min-h-[46px] w-full shrink-0 items-center justify-center rounded-brand-pill px-5 text-sm font-semibold transition sm:w-auto ${
                                                !mpConfigured
                                                    ? 'cursor-not-allowed bg-brand-surface-alt text-brand-text-secondary'
                                                    : 'bg-brand-primary text-brand-on-primary shadow-brand-cta hover:bg-brand-primary-hover disabled:opacity-60'
                                            }`}
                                        >
                                            {processing ? 'Conectando con MercadoPago…' : 'Activar con MercadoPago'}
                                        </button>
                                    </div>

                                    {!mpConfigured && (
                                        <p className="text-xs text-brand-text-secondary">
                                            El pago online no está disponible en este momento. Escribinos y lo resolvemos.
                                        </p>
                                    )}
                                </form>
                            )}
                        </section>

                        {/* Historial de pagos */}
                        <section data-tour="owner-suscripcion-pagos" className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start gap-3">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-link shadow-sm">
                                    <IconFileInvoice size={22} stroke={1.8} />
                                </span>
                                <div>
                                    <h3 className="text-xl font-semibold tracking-[-0.03em] text-brand-text">Pagos</h3>
                                    <p className="mt-1 text-sm text-brand-text-secondary">Los últimos cobros de tu suscripción.</p>
                                </div>
                            </div>

                            {payments.length === 0 ? (
                                <p className="mt-6 rounded-[22px] border border-dashed border-brand-border bg-brand-surface-alt px-4 py-6 text-center text-sm text-brand-text-secondary">
                                    Todavía no hay cobros registrados
                                    {subscription.status === 'trial' ? ' — el primero llega cuando termina tu prueba.' : '.'}
                                </p>
                            ) : (
                                <div className="mt-6 overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                                <th className="pb-3 pr-4">Fecha</th>
                                                <th className="pb-3 pr-4">Monto</th>
                                                <th className="pb-3 pr-4">Estado</th>
                                                <th data-tour="owner-suscripcion-factura" className="hidden pb-3 md:table-cell">Factura</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-brand-border-subtle">
                                            {payments.map((payment) => (
                                                <tr key={payment.id}>
                                                    <td className="py-3 pr-4 font-medium text-brand-text">
                                                        {payment.paid_at ?? '—'}
                                                    </td>
                                                    <td className="py-3 pr-4 font-semibold text-brand-text">
                                                        {formatARS(payment.amount)}
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <PaymentStatusBadge status={payment.status} />
                                                    </td>
                                                    <td className="hidden py-3 md:table-cell">
                                                        <InvoiceCell payment={payment} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Cambio de plan */}
                    {availablePlans.length > 0 && (
                        <section data-tour="owner-suscripcion-upgrade" className="space-y-4">
                            <div>
                                <h3 className="text-xl font-semibold tracking-[-0.03em] text-brand-text">Cambiar de plan</h3>
                                <p className="mt-1 text-sm text-brand-text-secondary">
                                    Hoy usás {currentUsage.barberias} barbería{currentUsage.barberias === 1 ? '' : 's'} y{' '}
                                    {currentUsage.barberos} barbero{currentUsage.barberos === 1 ? '' : 's'} activos — el plan nuevo
                                    tiene que alcanzarte para eso.
                                </p>
                            </div>

                            <div
                                className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0 2xl:grid-cols-3"
                                role="region"
                                aria-label="Planes disponibles para cambiar"
                            >
                                {availablePlans.map((plan) => (
                                    <article
                                        key={plan.id}
                                        className="flex w-full shrink-0 snap-start snap-always flex-col rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7 md:w-auto md:snap-align-none"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <h4 className="font-display text-2xl font-bold tracking-[-0.04em] text-brand-text">
                                                {plan.name}
                                            </h4>
                                            <p className="shrink-0 text-lg font-bold text-brand-text">
                                                {formatARS(plan.price)}
                                                <span className="text-xs font-medium text-brand-text-secondary">/mes</span>
                                            </p>
                                        </div>

                                        <p className="mt-3 text-sm text-brand-text-secondary">
                                            {plan.max_barberias === null ? 'Barberías sin límite' : `Hasta ${plan.max_barberias} barbería${plan.max_barberias === 1 ? '' : 's'}`}
                                            {' · '}
                                            {plan.max_barberos === null ? 'barberos sin límite' : `hasta ${plan.max_barberos} barbero${plan.max_barberos === 1 ? '' : 's'}`}
                                        </p>

                                        {plan.included_items?.length > 0 && (
                                            <ul className="mt-4 space-y-1.5 text-sm text-brand-text-secondary">
                                                {plan.included_items.map((item) => (
                                                    <li key={item} className="flex items-start gap-2">
                                                        <IconRosetteDiscountCheck size={16} stroke={1.9} className="mt-0.5 shrink-0 text-brand-primary" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => setPlanToConfirm(plan)}
                                            className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-brand-pill border border-brand-border bg-brand-surface-alt px-4 text-sm font-semibold text-brand-text transition hover:border-brand-primary/20 hover:bg-brand-primary/5 hover:text-brand-link"
                                        >
                                            Cambiar a este plan
                                            <IconArrowUpRight size={16} stroke={2} />
                                        </button>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* Confirmación de cambio de plan */}
            <Modal show={planToConfirm !== null} onClose={() => setPlanToConfirm(null)} maxWidth="md">
                {planToConfirm && (
                    <div className="p-6">
                        <h3 className="font-display text-xl font-bold text-brand-text">
                            ¿Cambiar al plan {planToConfirm.name}?
                        </h3>
                        <p className="mt-3 text-sm text-brand-text-secondary">
                            Tu suscripción pasa a costar {formatARS(planToConfirm.price)} por mes
                            {!subscription.has_preapproval
                                ? '.'
                                : isAnnual
                                  ? ' — como facturás anual, el nuevo precio se cobra recién en tu próxima renovación (el año en curso no se prorratea).'
                                  : ' y actualizamos el débito automático en MercadoPago desde el próximo cobro.'}
                        </p>
                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <SecondaryButton onClick={() => setPlanToConfirm(null)}>Cancelar</SecondaryButton>
                            <button
                                type="button"
                                onClick={confirmPlanChange}
                                disabled={changingPlan}
                                className="inline-flex min-h-[44px] items-center justify-center rounded-brand-pill bg-brand-primary px-5 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover disabled:opacity-60"
                            >
                                {changingPlan ? 'Aplicando…' : 'Confirmar cambio'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
