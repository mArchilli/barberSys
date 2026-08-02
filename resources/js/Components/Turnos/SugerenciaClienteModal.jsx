import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function SugerenciaClienteModal({ sugerencia, onConfirm }) {
    const sugerido = sugerencia?.precarga?.cliente_sugerido;

    return (
        <Modal show={Boolean(sugerencia)} onClose={() => onConfirm(false)} maxWidth="sm">
            <div className="p-6 sm:p-7">
                <h3 className="font-display text-lg font-bold text-brand-text">¿Es este cliente?</h3>
                <p className="mt-2 text-sm text-brand-text-secondary">
                    Encontramos un cliente ya cargado con el mismo nombre:{' '}
                    <span className="font-semibold text-brand-text">{sugerido?.name}</span>
                    {sugerido?.phone && ` (${sugerido.phone})`}. Confirmá si es la misma persona antes de continuar
                    a la carga de corte: asignarlo mal mezclaría el historial de dos clientes distintos.
                </p>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <SecondaryButton onClick={() => onConfirm(false)}>No, cargar como nuevo</SecondaryButton>
                    <PrimaryButton onClick={() => onConfirm(true)}>Sí, es el mismo cliente</PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}
