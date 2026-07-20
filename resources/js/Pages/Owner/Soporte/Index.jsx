import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { IconBrandWhatsapp, IconEye, IconEyeOff } from '@tabler/icons-react';
import { useState } from 'react';

function buildWhatsappMessage(account, message) {
    const lines = [
        'Hola, soy ' + account.name + ' (' + account.email + ').',
        account.plan_name ? 'Plan: ' + account.plan_name + '.' : null,
        account.barberia_name ? 'Barbería: ' + account.barberia_name + '.' : null,
        '',
        message,
    ].filter((line) => line !== null);

    return lines.join('\n');
}

export default function Index({ supportNumber, account }) {
    const { flash } = usePage().props;
    const [showPreview, setShowPreview] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        message: '',
    });

    const fullMessage = buildWhatsappMessage(account, data.message || '');
    const canSend = Boolean(supportNumber) && data.message.trim().length > 0;

    const handleSend = (e) => {
        e.preventDefault();

        if (!canSend) {
            return;
        }

        const whatsappUrl =
            'https://wa.me/' + supportNumber + '?text=' + encodeURIComponent(fullMessage);

        // Abrir WhatsApp es la acción que le importa al owner — se dispara acá,
        // dentro del click, para no perder el gesto de usuario. El registro es
        // secundario y no debe bloquear ni condicionar la redirección.
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

        post(route('owner.soporte.store'), {
            preserveScroll: true,
            onSuccess: () => reset('message'),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Soporte
                </h2>
            }
        >
            <Head title="Soporte" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-3xl space-y-4 px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="rounded-brand-md border border-brand-success/30 bg-brand-success-soft p-4 text-sm text-brand-success">
                            {flash.success}
                        </div>
                    )}

                    <div className="rounded-brand-lg border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-8">
                        <p className="text-sm leading-6 text-brand-text-secondary">
                            Contanos tu consulta y te redirigimos a WhatsApp con el
                            mensaje ya armado, junto con los datos de tu cuenta para
                            que no tengas que repetirlos. Vos confirmás el envío
                            desde WhatsApp.
                        </p>

                        {!supportNumber && (
                            <div className="mt-4 rounded-brand-md border border-brand-warning/30 bg-brand-warning-soft p-4 text-sm text-brand-warning">
                                El número de soporte todavía no está configurado.
                                Probá de nuevo más tarde.
                            </div>
                        )}

                        <form onSubmit={handleSend} className="mt-6 space-y-4">
                            <div>
                                <InputLabel htmlFor="message" value="Tu consulta" />
                                <textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    rows={5}
                                    className="mt-1 block w-full rounded-md border border-brand-border bg-brand-surface text-brand-text shadow-sm placeholder:text-brand-text-secondary/70 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
                                    placeholder="Contanos qué necesitás..."
                                />
                                <InputError message={errors.message} className="mt-2" />
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowPreview((value) => !value)}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline"
                            >
                                {showPreview ? <IconEyeOff size={16} stroke={2} /> : <IconEye size={16} stroke={2} />}
                                {showPreview ? 'Ocultar' : 'Ver'} cómo se va a ver el mensaje
                            </button>

                            {showPreview && (
                                <div className="whitespace-pre-wrap rounded-brand-md border border-brand-border-subtle bg-brand-surface-alt/70 p-4 text-sm leading-6 text-brand-text-secondary">
                                    {fullMessage}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={!canSend || processing}
                                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-brand-pill bg-brand-primary px-6 text-sm font-bold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <IconBrandWhatsapp size={20} stroke={2.1} />
                                Enviar por WhatsApp
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
