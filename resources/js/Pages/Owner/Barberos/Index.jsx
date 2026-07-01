import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ barberos, planLimit }) {
    const { flash } = usePage().props;
    const credentialFlash = flash.newBarbero || flash.resetPassword;
    const [showCredential, setShowCredential] = useState(!!credentialFlash);

    function handleResetPassword(barbero) {
        if (! confirm(`¿Resetear la contraseña de ${barbero.name}? Se generará una nueva contraseña aleatoria y el barbero deberá cambiarla al ingresar.`)) return;
        router.patch(route('owner.barberos.resetPassword', barbero.id));
    }

    function handleDeactivate(barbero) {
        if (! confirm(`¿Dar de baja a ${barbero.name}? Su cuenta quedará inactiva.`)) return;
        router.patch(route('owner.barberos.deactivate', barbero.id));
    }

    const atLimit = planLimit.max !== null && planLimit.current >= planLimit.max;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Barberos
                    </h2>
                    <Link
                        href={route('owner.barberos.create')}
                        className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition ${
                            atLimit
                                ? 'cursor-not-allowed bg-gray-400'
                                : 'bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                        }`}
                        onClick={atLimit ? (e) => e.preventDefault() : undefined}
                    >
                        + Nuevo barbero
                    </Link>
                </div>
            }
        >
            <Head title="Barberos" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-4">

                    {/* Contraseña generada — se muestra una sola vez */}
                    {showCredential && credentialFlash && (
                        <div className="rounded-lg border border-green-300 bg-green-50 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-semibold text-green-800">
                                        {flash.newBarbero ? 'Barbero creado exitosamente' : 'Contraseña reseteada'}
                                    </p>
                                    <p className="mt-1 text-sm text-green-700">
                                        Pasale esta contraseña a{' '}
                                        <span className="font-medium">{credentialFlash.name}</span>.
                                        No se va a mostrar de nuevo.
                                    </p>
                                    <p className="mt-2 rounded bg-white px-3 py-2 font-mono text-lg font-bold tracking-widest text-gray-900 border border-green-200 inline-block">
                                        {credentialFlash.password}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowCredential(false)}
                                    className="text-green-600 hover:text-green-800 text-lg font-bold leading-none"
                                    aria-label="Cerrar"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Indicador de plan */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <span className="text-sm text-gray-500">
                                Barberos activos:{' '}
                                <span className={`font-semibold ${atLimit ? 'text-red-600' : 'text-gray-800'}`}>
                                    {planLimit.current}
                                    {planLimit.max !== null && ` / ${planLimit.max}`}
                                </span>
                                {planLimit.max === null && ' (sin límite)'}
                            </span>
                            {atLimit && (
                                <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                    Límite de plan alcanzado
                                </span>
                            )}
                        </div>

                        {/* Tabla */}
                        {barberos.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                Todavía no hay barberos cargados.{' '}
                                {! atLimit && (
                                    <Link
                                        href={route('owner.barberos.create')}
                                        className="text-indigo-600 hover:underline"
                                    >
                                        Crear el primero
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                    <tr>
                                        <th className="px-6 py-3">Nombre</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3">Teléfono</th>
                                        <th className="px-6 py-3">Barbería</th>
                                        <th className="px-6 py-3">Sueldo</th>
                                        <th className="px-6 py-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {barberos.map((b) => (
                                        <tr key={b.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {b.name}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{b.email}</td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {b.phone ?? '—'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {b.barberia.name}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {b.salary_type === 'fixed'
                                                    ? `Fijo: $${Number(b.salary_amount).toLocaleString('es-AR')}`
                                                    : `Comisión: ${b.commission_pct}%`}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <Link
                                                    href={route('owner.barberos.edit', b.id)}
                                                    className="text-indigo-600 hover:underline font-medium"
                                                >
                                                    Editar
                                                </Link>
                                                <button
                                                    onClick={() => handleResetPassword(b)}
                                                    className="text-yellow-600 hover:underline font-medium"
                                                >
                                                    Resetear clave
                                                </button>
                                                <button
                                                    onClick={() => handleDeactivate(b)}
                                                    className="text-red-500 hover:underline font-medium"
                                                >
                                                    Dar de baja
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
