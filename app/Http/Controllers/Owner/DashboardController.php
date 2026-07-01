<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $barberia = $user->barberias()->where('active', true)->first();

        return Inertia::render('Owner/Dashboard', [
            'barberia' => $barberia ? ['name' => $barberia->name] : null,
        ]);
    }
}
