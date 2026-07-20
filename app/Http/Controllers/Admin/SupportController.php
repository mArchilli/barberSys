<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportRequest;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    public function index(): Response
    {
        $requests = SupportRequest::with('owner:id,name,email')
            ->orderByDesc('created_at')
            ->limit(200)
            ->get()
            ->map(fn (SupportRequest $request) => [
                'id' => $request->id,
                'owner_name' => $request->owner->name,
                'owner_email' => $request->owner->email,
                'message' => $request->message,
                'created_at' => $request->created_at->toDateTimeString(),
            ]);

        return Inertia::render('Admin/Soporte/Index', [
            'requests' => $requests,
        ]);
    }
}
