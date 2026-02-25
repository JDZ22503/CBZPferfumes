<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Party;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductSet;
use App\Models\Attar;

class DashboardController extends Controller
{
    public function index()
    {
        $settings = \App\Models\Setting::pluck('value', 'key');
        
        return response()->json([
            'totalParties' => Party::count(),
            'totalProducts' => Product::count(),
            'totalProductSets' => ProductSet::count(),
            'totalAttars' => Attar::count(),
            'pendingOrders' => Order::where('status', 'pending')->count(),
            'completedOrders' => Order::where('status', 'completed')->count(),
            'cancelledOrders' => Order::where('status', 'cancelled')->count(),
            'settings' => [
                'gst_rate' => (float)($settings['gst_rate'] ?? 18),
            ]
        ]);
    }
}
