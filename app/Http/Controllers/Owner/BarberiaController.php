<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BarberiaController extends Controller
{
    public function index()
    {
        $owner = Auth::user();
        $barberias = $owner->barberias()->where('active', true)->get(['id', 'name', 'address']);

        if ($barberias->count() === 1) {
            return redirect()->route('owner.barberias.dashboard', $barberias->first()->id);
        }

        return Inertia::render('Owner/Barberias/Index', [
            'barberias' => $barberias,
        ]);
    }
}
