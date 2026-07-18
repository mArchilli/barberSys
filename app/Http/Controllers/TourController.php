<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TourController extends Controller
{
    public function markSeen(Request $request, string $tourKey): JsonResponse
    {
        $user = $request->user();

        $toursSeen = $user->tours_seen ?? [];
        $toursSeen[$tourKey] = true;
        $user->update(['tours_seen' => $toursSeen]);

        return response()->json(['success' => true]);
    }
}
