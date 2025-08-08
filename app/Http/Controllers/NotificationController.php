<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        $notifications = Auth::user()->notifications()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'category' => $notification->category,
                    'read' => $notification->read,
                    'timestamp' => $notification->created_at,
                    'data' => $notification->data
                ];
            });

        return response()->json($notifications);
    }

    public function markAsRead(Request $request): JsonResponse
    {
        $notification = Notification::findOrFail($request->notification_id);
        
        if ($notification->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $notification->markAsRead();

        return response()->json(['message' => 'Notification marked as read']);
    }

    public function markAllAsRead(): JsonResponse
    {
        Auth::user()->notifications()->unread()->update(['read' => true]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    public function delete(Request $request): JsonResponse
    {
        $notification = Notification::findOrFail($request->notification_id);
        
        if ($notification->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }

    public function clearAll(): JsonResponse
    {
        Auth::user()->notifications()->delete();

        return response()->json(['message' => 'All notifications cleared']);
    }

    public function create(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'type' => 'required|in:success,error,warning,info',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'category' => 'nullable|string|max:50',
            'data' => 'nullable|array'
        ]);

        $notification = Notification::create([
            'user_id' => $request->user_id,
            'type' => $request->type,
            'title' => $request->title,
            'message' => $request->message,
            'category' => $request->category,
            'data' => $request->data
        ]);

        return response()->json([
            'message' => 'Notification created successfully',
            'notification' => $notification
        ]);
    }
} 