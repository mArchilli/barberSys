import { router } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';

/**
 * Cambia el estado de un turno (axios, ver Owner\TurnoController::update /
 * BarberTurnoController::update) y, al completarlo, decide cómo llegar a la
 * carga de corte con los datos precargados:
 * - Match de cliente por teléfono (confiable): redirige directo con ese cliente_id.
 * - Match solo por nombre (ambiguo, puede haber homónimos): pide confirmación
 *   antes de asociarlo — nunca se asigna solo.
 * - Sin match: redirige para crear el cliente como nuevo, igual que la carga libre.
 *
 * Compartido entre el calendario del owner y la agenda del barbero; cada uno
 * le pasa sus propias rutas.
 *
 * onConfirm (pendiente -> confirmado) pega a un endpoint aparte del genérico
 * de cambio de estado (ver Owner\TurnoController::confirmar) — nunca se
 * mezcla con onStatusChange. buildConfirmUrl es opcional: el barbero no
 * confirma turnos, así que su pantalla no lo pasa.
 */
export default function useTurnoCompletion({ buildUpdateUrl, buildConfirmUrl, cortesIndexUrl, onRefresh }) {
    const [sugerencia, setSugerencia] = useState(null);

    function irACargarCorte(precarga, clienteId) {
        router.get(cortesIndexUrl, {
            servicio_id: precarga.servicio_id,
            cliente_id: clienteId ?? '',
            cliente_nombre: precarga.cliente_nombre,
            cliente_telefono: precarga.cliente_telefono,
        });
    }

    async function onStatusChange(turno, status) {
        const response = await axios.patch(buildUpdateUrl(turno), { status });
        const precarga = response.data?.precarga;

        if (status === 'completado' && precarga) {
            if (precarga.cliente_id) {
                irACargarCorte(precarga, precarga.cliente_id);
                return;
            }

            if (precarga.cliente_sugerido) {
                setSugerencia({ precarga });
                return;
            }

            irACargarCorte(precarga, null);
            return;
        }

        onRefresh?.();
    }

    function confirmarSugerencia(aceptar) {
        if (!sugerencia) return;

        const { precarga } = sugerencia;
        setSugerencia(null);
        irACargarCorte(precarga, aceptar ? precarga.cliente_sugerido.id : null);
    }

    async function onConfirm(turno) {
        await axios.patch(buildConfirmUrl(turno));
        onRefresh?.();
    }

    return { onStatusChange, onConfirm, sugerencia, confirmarSugerencia };
}
