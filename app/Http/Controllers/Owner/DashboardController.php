<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Barberia;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Barberia $barberia): Response
    {
        return Inertia::render('Owner/Dashboard');
    }
}
