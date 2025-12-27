<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Party;
use App\Models\Order;

class DashboardController extends Controller
{
    public function index()
    {
        $settings = \App\Models\Setting::pluck('value', 'key');
        
        return response()->json([
            'totalParties' => Party::count(),
            'pendingOrders' => Order::where('status', 'pending')->count(),
            'completedOrders' => Order::where('status', 'completed')->count(),
            'cancelledOrders' => Order::where('status', 'cancelled')->count(),
            'settings' => [
                'gst_rate' => (float)($settings['gst_rate'] ?? 18),
            ]
        ]);
    }
}
