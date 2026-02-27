<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Attar;
use App\Models\ProductSet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class CollectionsController extends Controller
{
    public function index(Request $request)
    {
        // Fetch active Products with details
        $products = Product::with('productDetail')
            ->whereHas('productDetail', function ($q) {
                $q->where('is_active', true);
            })
            ->latest()
            ->get();

        // Fetch active Attars with details
        $attars = Attar::with('attarDetail')
            ->whereHas('attarDetail', function ($q) {
                $q->where('is_active', true);
            })
            ->latest()
            ->get();

        // Fetch active Gift Sets with details
        $productSets = ProductSet::with('productSetDetail')
            ->whereHas('productSetDetail', function ($q) {
                $q->where('is_active', true);
            })
            ->latest()
            ->get();

        // Identify Latest Items (Top 4 overall)
        $latestItems = collect()
            ->merge($products->take(2))
            ->merge($attars->take(2))
            ->merge($productSets->take(2))
            ->sortByDesc('created_at')
            ->take(4)
            ->values();

        // Combine all items for the main grid and sort by latest
        $allItems = collect()
            ->merge($products)
            ->merge($attars)
            ->merge($productSets)
            ->sortByDesc('created_at')
            ->values();

        // Manual Pagination
        $perPage = 12;
        $page = $request->input('page', 1);
        $offset = ($page - 1) * $perPage;
        
        $paginatedItems = new \Illuminate\Pagination\LengthAwarePaginator(
            $allItems->slice($offset, $perPage)->values(),
            $allItems->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return Inertia::render('collections', [
            'allItems' => $paginatedItems,
            'latestItems' => $latestItems,
            'canRegister' => Features::enabled(Features::registration()),
        ]);
    }
}
