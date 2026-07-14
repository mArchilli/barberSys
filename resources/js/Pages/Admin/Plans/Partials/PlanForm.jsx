import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Link } from '@inertiajs/react';
import { IconArrowDown, IconArrowUp, IconPlus, IconTrash } from '@tabler/icons-react';

function LimitWarning({ exceededBy, unit }) {
    if (exceededBy.length === 0) return null;

    return (
        <div className="mt-2 rounded-brand-sm border border-brand-warning/30 bg-brand-warning/10 p-3 text-xs text-brand-text">
            <p className="font-semibold text-brand-warning">
                {exceededBy.length} owner(s) ya superan este límite
            </p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-brand-text-secondary">
                {exceededBy.map((s) => (
                    <li key={s.owner_id}>{s.owner_name} — {s.count} {unit}</li>
                ))}
            </ul>
            <p className="mt-1 text-brand-text-secondary">
                No se bloquea el guardado ni se pierde nada: esos owners simplemente no van a poder cargar más hasta que ajustes su suscripción.
            </p>
        </div>
    );
}

export default function PlanForm({ data, setData, errors, processing, knownFeatures, subscriberUsage = [], submitLabel, onSubmit, cancelHref }) {
    const maxBarberiasValue = data.max_barberias === '' ? null : Number(data.max_barberias);
    const maxBarberosValue = data.max_barberos === '' ? null : Number(data.max_barberos);

    const barberiasExceeded = maxBarberiasValue !== null
        ? subscriberUsage
            .filter((s) => s.custom_max_barberias === null && s.barberias_count > maxBarberiasValue)
            .map((s) => ({ owner_id: s.owner_id, owner_name: s.owner_name, count: s.barberias_count }))
        : [];

    const barberosExceeded = maxBarberosValue !== null
        ? subscriberUsage
            .filter((s) => s.custom_max_barberos === null && s.barberos_count > maxBarberosValue)
            .map((s) => ({ owner_id: s.owner_id, owner_name: s.owner_name, count: s.barberos_count }))
        : [];

    const includedItems = data.included_items ?? [];

    function addIncludedItem() {
        setData('included_items', [...includedItems, '']);
    }

    function updateIncludedItem(index, value) {
        setData('included_items', includedItems.map((item, i) => (i === index ? value : item)));
    }

    function removeIncludedItem(index) {
        setData('included_items', includedItems.filter((_, i) => i !== index));
    }

    function moveIncludedItem(index, direction) {
        const target = index + direction;
        if (target < 0 || target >= includedItems.length) return;

        const reordered = [...includedItems];
        [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
        setData('included_items', reordered);
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <InputLabel htmlFor="name" value="Nombre *" />
                    <TextInput
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Ej: Plan Pro"
                        autoFocus
                    />
                    <InputError message={errors.name} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="slug" value="Slug *" />
                    <TextInput
                        id="slug"
                        value={data.slug}
                        onChange={(e) => setData('slug', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Ej: plan-pro"
                    />
                    <InputError message={errors.slug} className="mt-1" />
                </div>
            </div>

            <div>
                <InputLabel htmlFor="price" value="Precio mensual ($) *" />
                <TextInput
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={data.price}
                    onChange={(e) => setData('price', e.target.value)}
                    className="mt-1 block w-full sm:w-64"
                />
                <InputError message={errors.price} className="mt-1" />
                <p className="mt-1 text-xs text-brand-text-secondary">
                    Cambiar este precio no afecta a los owners ya suscriptos — solo aplica a suscripciones nuevas de acá en adelante.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <InputLabel htmlFor="max_barberias" value="Máx. barberías" />
                    <TextInput
                        id="max_barberias"
                        type="number"
                        min="1"
                        value={data.max_barberias}
                        onChange={(e) => setData('max_barberias', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Ilimitado"
                    />
                    <InputError message={errors.max_barberias} className="mt-1" />
                    <LimitWarning exceededBy={barberiasExceeded} unit="barberías" />
                </div>

                <div>
                    <InputLabel htmlFor="max_barberos" value="Máx. barberos" />
                    <TextInput
                        id="max_barberos"
                        type="number"
                        min="1"
                        value={data.max_barberos}
                        onChange={(e) => setData('max_barberos', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Ilimitado"
                    />
                    <InputError message={errors.max_barberos} className="mt-1" />
                    <LimitWarning exceededBy={barberosExceeded} unit="barberos" />
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
                <label className="flex cursor-pointer items-center gap-3">
                    <Checkbox checked={data.is_custom} onChange={(e) => setData('is_custom', e.target.checked)} />
                    <span className="text-sm font-medium text-brand-text">Plan a medida (custom)</span>
                </label>

                <label className="flex cursor-pointer items-center gap-3">
                    <Checkbox checked={data.active} onChange={(e) => setData('active', e.target.checked)} />
                    <span className="text-sm font-medium text-brand-text">Plan activo</span>
                </label>
            </div>

            <div>
                <InputLabel value="Features" />
                <p className="mt-1 text-xs text-brand-text-secondary">
                    Secciones comerciales que este plan habilita, además de los límites de cantidad.
                </p>
                <div className="mt-3 space-y-2">
                    {Object.entries(knownFeatures).map(([key, label]) => (
                        <label key={key} className="flex cursor-pointer items-center gap-3">
                            <Checkbox
                                checked={!!data.features[key]}
                                onChange={(e) => setData('features', { ...data.features, [key]: e.target.checked })}
                            />
                            <span className="text-sm text-brand-text">{label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="border-t border-brand-border-subtle pt-6">
                <InputLabel value="Qué incluye (visible para el owner)" />
                <p className="mt-1 text-xs text-brand-text-secondary">
                    Lista descriptiva que se muestra al elegir el plan (registro) y en el listado de planes. No activa nada por sí sola.
                </p>

                <div className="mt-2 rounded-brand-sm border border-brand-border-subtle bg-brand-surface-alt p-3 text-xs text-brand-text-secondary">
                    <span className="font-semibold text-brand-text">Ojo: </span>
                    este texto es solo descriptivo — no gatea ninguna funcionalidad. Si un ítem menciona algo controlado por un feature
                    flag (ej. el ranking de productividad), activá también el flag correspondiente arriba, en Features, o el plan va a
                    prometer algo que todavía no cumple.
                </div>

                <div className="mt-3 space-y-2">
                    {includedItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <TextInput
                                value={item}
                                onChange={(e) => updateIncludedItem(index, e.target.value)}
                                className="block w-full"
                                placeholder="Ej: Hasta 3 barberos"
                            />
                            <button
                                type="button"
                                onClick={() => moveIncludedItem(index, -1)}
                                disabled={index === 0}
                                aria-label="Subir línea"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-brand-sm border border-brand-border text-brand-text-secondary transition hover:bg-brand-surface disabled:opacity-30"
                            >
                                <IconArrowUp size={16} stroke={2} />
                            </button>
                            <button
                                type="button"
                                onClick={() => moveIncludedItem(index, 1)}
                                disabled={index === includedItems.length - 1}
                                aria-label="Bajar línea"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-brand-sm border border-brand-border text-brand-text-secondary transition hover:bg-brand-surface disabled:opacity-30"
                            >
                                <IconArrowDown size={16} stroke={2} />
                            </button>
                            <button
                                type="button"
                                onClick={() => removeIncludedItem(index)}
                                aria-label="Quitar línea"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-brand-sm border border-brand-danger/30 text-brand-danger transition hover:bg-brand-danger-soft"
                            >
                                <IconTrash size={16} stroke={2} />
                            </button>
                        </div>
                    ))}
                </div>

                <InputError message={errors.included_items} className="mt-2" />

                <SecondaryButton onClick={addIncludedItem} className="mt-3">
                    <IconPlus size={16} stroke={2} className="mr-1.5" />
                    Agregar línea
                </SecondaryButton>
            </div>

            <div className="flex flex-col gap-3 border-t border-brand-border-subtle pt-6 sm:flex-row sm:items-center sm:justify-end">
                <Link
                    href={cancelHref}
                    className="flex min-h-[44px] items-center justify-center text-sm text-brand-text-secondary hover:text-brand-text sm:min-h-0"
                >
                    Cancelar
                </Link>
                <PrimaryButton disabled={processing} className="w-full justify-center sm:w-auto">
                    {submitLabel}
                </PrimaryButton>
            </div>
        </form>
    );
}
