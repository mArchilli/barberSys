import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { IconLock } from '@tabler/icons-react';
import { useState } from 'react';

export default function Edit({ barberia, activeBarberosCount }) {
    const { errors: pageErrors } = usePage().props;
    const { data, setData, put, processing, errors } = useForm({
        name: barberia.name,
        address: barberia.address ?? '',
    });

    const [showCerrarModal, setShowCerrarModal] = useState(false);
    const [cerrando, setCerrando] = useState(false);
    const [reactivando, setReactivando] = useState(false);

    function submit(e) {
        e.preventDefault();
        put(route('owner.barberias.update', barberia.id));
    }

    function confirmarCierre() {
        setCerrando(true);
        router.patch(route('owner.barberias.deactivate', barberia.id), {}, {
            onFinish: () => {
                setCerrando(false);
                setShowCerrarModal(false);
            },
        });
    }

    function reactivar() {
        setReactivando(true);
        router.patch(route('owner.barberias.reactivate', barberia.id), {}, {
            onFinish: () => setReactivando(false),
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold leading-tight text-brand-text">
                        Editar barbería
                    </h2>
                    {! barberia.active && (
                        <span className="inline-flex items-center gap-1 rounded-brand-pill border border-brand-border bg-brand-surface-alt px-2.5 py-1 text-xs font-medium text-brand-text-secondary">
                            <IconLock size={12} />
                            Cerrada
                        </span>
                    )}
                </div>
            }
        >
            <Head title="Editar barbería" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl space-y-6 sm:px-6 lg:px-8">
                    {! barberia.active && (
                        <div className="rounded-brand-md border border-brand-border bg-brand-surface-alt px-4 py-3 text-sm text-brand-text-secondary sm:mx-0">
                            Esta barbería está cerrada. Podés seguir editando su nombre y dirección, pero no se pueden cargar cortes, gastos ni barberos hasta que la reactives.
                        </div>
                    )}

                    <div className="overflow-hidden rounded-brand-lg border border-brand-border bg-brand-surface shadow-brand-card">
                        <div className="p-8">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Nombre de la barbería *" />
                                    <TextInput
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full"
                                        autoFocus
                                    />
                                    <InputError message={errors.name} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="address" value="Dirección" />
                                    <TextInput
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="Opcional"
                                    />
                                    <InputError message={errors.address} className="mt-1" />
                                </div>

                                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                                    <Link
                                        href={route('owner.barberias.index')}
                                        className="flex min-h-[44px] items-center justify-center text-sm text-brand-text-secondary hover:text-brand-text sm:min-h-0"
                                    >
                                        Cancelar
                                    </Link>
                                    <PrimaryButton disabled={processing} className="w-full sm:w-auto">
                                        Guardar cambios
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-brand-lg border border-brand-border bg-brand-surface shadow-brand-card">
                        <div className="flex flex-col gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
                            {barberia.active ? (
                                <>
                                    <div>
                                        <h3 className="font-display text-base font-bold text-brand-text">Cerrar barbería</h3>
                                        <p className="mt-1 text-sm text-brand-text-secondary">
                                            La barbería y sus barberos quedan inactivos. No se elimina ningún dato y podés reactivarla cuando quieras.
                                        </p>
                                    </div>
                                    <DangerButton
                                        type="button"
                                        onClick={() => setShowCerrarModal(true)}
                                        className="w-full justify-center sm:w-auto"
                                    >
                                        Cerrar barbería
                                    </DangerButton>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <h3 className="font-display text-base font-bold text-brand-text">Reactivar barbería</h3>
                                        <p className="mt-1 text-sm text-brand-text-secondary">
                                            Vuelve a quedar operativa. Los barberos que estaban activos al momento del cierre siguen inactivos — reactivalos desde la sección de barberos si corresponde.
                                        </p>
                                        {pageErrors?.plan_limit && (
                                            <p className="mt-2 text-sm text-brand-danger">{pageErrors.plan_limit}</p>
                                        )}
                                    </div>
                                    <PrimaryButton
                                        type="button"
                                        onClick={reactivar}
                                        disabled={reactivando}
                                        className="w-full justify-center sm:w-auto"
                                    >
                                        Reactivar
                                    </PrimaryButton>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showCerrarModal} onClose={() => setShowCerrarModal(false)} maxWidth="md">
                <div className="p-6">
                    <h2 className="font-display text-lg font-bold text-brand-text">
                        ¿Cerrar "{barberia.name}"?
                    </h2>
                    <p className="mt-3 text-sm text-brand-text-secondary">
                        {activeBarberosCount > 0 ? (
                            <>
                                Esta acción también va a dar de baja en cascada a{' '}
                                <span className="font-semibold text-brand-text">
                                    {activeBarberosCount} {activeBarberosCount === 1 ? 'barbero activo' : 'barberos activos'}
                                </span>{' '}
                                de esta barbería. Ninguno pierde su información — quedan inactivos y podés reactivarlos individualmente.
                            </>
                        ) : (
                            'Esta barbería no tiene barberos activos en este momento.'
                        )}
                    </p>
                    <p className="mt-2 text-sm text-brand-text-secondary">
                        La barbería deja de estar disponible para cargar cortes, gastos y nuevas altas hasta que la reactives. No se elimina ningún dato histórico.
                    </p>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <SecondaryButton
                            type="button"
                            onClick={() => setShowCerrarModal(false)}
                            className="w-full justify-center sm:w-auto"
                        >
                            Cancelar
                        </SecondaryButton>
                        <DangerButton
                            type="button"
                            onClick={confirmarCierre}
                            disabled={cerrando}
                            className="w-full justify-center sm:w-auto"
                        >
                            Sí, cerrar barbería
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
