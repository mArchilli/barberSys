<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangePasswordRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PasswordChangeController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Auth/ChangePassword');
    }

    public function update(ChangePasswordRequest $request)
    {
        $user = Auth::user();

        $user->update([
            'password'             => $request->password,
            'must_change_password' => false,
        ]);

        return redirect()->route("{$user->role}.dashboard");
    }
}
