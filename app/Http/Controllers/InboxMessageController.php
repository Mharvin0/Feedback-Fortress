<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\InboxMessage;

class InboxMessageController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $messages = InboxMessage::where('user_id', $user->id)
            ->orderByDesc('is_pinned')
            ->orderBy('is_read')
            ->orderByDesc('created_at')
            ->get();
        return response()->json(['messages' => $messages]);
    }
}
