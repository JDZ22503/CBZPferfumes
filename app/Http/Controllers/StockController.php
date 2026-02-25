<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ProductSet;
use App\Models\Product;
use App\Models\Attar;
use Inertia\Inertia;

class StockController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type', 'product'); // 'product', 'set', 'attar'
        $search = $request->query('search', '');

        if ($type === 'set') {
            $query = ProductSet::with('stock');
        } elseif ($type === 'attar') {
            $query = Attar::with('stock');
        } else {
            $query = Product::with('stock');
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $items = $query->paginate(10)->through(function ($item) use ($type) {
            $data = [
                'id' => $item->id,
                'name' => $item->name,
                'sku' => $item->sku,
                'image_path' => $item->image_path,
                'stock_id' => $item->stock ? $item->stock->id : null,
                'current_stock' => $item->stock_quantity,
                'is_active' => (bool)$item->is_active,
            ];

            if ($type === 'product') {
                $data['category'] = $item->category;
            }

            return $data;
        });

        return Inertia::render('Stocks/Index', [
            'items' => $items,
            'filters' => [
                'type' => $type,
                'search' => $search,
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:0',
            'type' => 'required|string|in:product,set,attar',
        ]);

        if ($validated['type'] === 'set') {
            $item = ProductSet::findOrFail($id);
        } elseif ($validated['type'] === 'attar') {
            $item = Attar::findOrFail($id);
        } else {
            $item = Product::findOrFail($id);
        }

        $item->stock_quantity = $validated['quantity'];
        $item->save();

        return redirect()->back();
    }

    public function toggleStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'type' => 'required|string|in:product,set,attar',
        ]);

        if ($validated['type'] === 'set') {
            $item = ProductSet::findOrFail($id);
        } elseif ($validated['type'] === 'attar') {
            $item = Attar::findOrFail($id);
        } else {
            $item = Product::findOrFail($id);
        }

        $item->is_active = !$item->is_active;
        $item->save();

        return redirect()->back();
    }
}
