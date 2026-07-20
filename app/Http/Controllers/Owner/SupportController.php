<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreSupportRequestRequest;
use App\Models\SupportRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    /**
     * El link de wa.me se arma enteramente en el frontend (no hay ningún
     * envío real del lado del servidor) — acá solo se entrega el número de
     * soporte y los datos de cuenta que el mensaje precargado va a incluir.
     */
    public function index(): Response
    {
        $owner = Auth::user();
        $subscription = $owner->subscription()->with('plan')->first();

        return Inertia::render('Owner/Soporte/Index', [
            'supportNumber' => config('services.whatsapp.support_number'),
            'account' => [
                'name' => $owner->name,
                'email' => $owner->email,
                'plan_name' => $subscription?->plan?->name,
                'barberia_name' => $owner->barberias()->where('active', true)->value('name'),
            ],
        ]);
    }

    /**
     * Registro liviano para que Admin tenga visibilidad de quién pidió ayuda
     * y cuándo — la conversación en sí ocurre en WhatsApp, no acá.
     */
    public function store(StoreSupportRequestRequest $request)
    {
        SupportRequest::create([
            'owner_id' => Auth::id(),
            'message' => $request->message,
        ]);

        return back()->with('success', 'Registramos tu consulta.');
    }
}
