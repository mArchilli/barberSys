import { IconCheck, IconCopy, IconLink } from '@tabler/icons-react';
import { useState } from 'react';

// Compartido entre el Dashboard y el Calendario de turnos: el owner activa
// turnos y carga un slug en Configuración, pero no tiene forma de saber qué
// link mandarle a sus clientes sin ir a buscarlo — este banner lo deja a
// mano en las dos pantallas que más visita. Null-safe: si todavía no hay
// link armado (turnos apagados o sin slug), no renderiza nada.
export default function PublicLinkBanner({ url }) {
    const [copied, setCopied] = useState(false);

    if (! url) return null;

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard API bloqueada (permisos, contexto sin TLS, etc.): el
            // link queda visible igual para copiarlo a mano.
        }
    }

    return (
        <div className="flex flex-col gap-3 rounded-brand-md border border-brand-primary/20 bg-brand-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-primary">
                    <IconLink size={18} stroke={1.8} />
                </span>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-text">Link público de reserva</p>
                    <p className="truncate text-xs text-brand-text-secondary" title={url}>
                        Compartilo con tus clientes para que reserven turno: {url}
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={handleCopy}
                className="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-1.5 rounded-full bg-brand-primary px-4 text-xs font-semibold text-brand-on-primary transition hover:bg-brand-primary-hover"
            >
                {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
                {copied ? 'Copiado' : 'Copiar link'}
            </button>
        </div>
    );
}
