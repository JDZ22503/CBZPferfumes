<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductSet;
use Illuminate\Http\Request;

class ProductSetController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->query('limit', 15);
        
        $query = ProductSet::latest();

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $productSets = $query->paginate($limit);

        return response()->json($productSets);
    }

    public function show(ProductSet $productSet)
    {
        return response()->json($productSet);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'required|numeric|min:0',
            'hsn_code' => 'nullable|string|max:20',
            'image' => 'nullable|image|max:2048',
        ]);

        $sku = \Illuminate\Support\Str::slug($validated['name']);
        $originalSku = $sku;
        $counter = 1;
        while (ProductSet::where('sku', $sku)->exists()) {
            $sku = $originalSku . '-' . $counter;
            $counter++;
        }
        $validated['sku'] = $sku;

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = $sku . '-' . time() . '.webp';
            $path = 'product-sets/' . $filename;
            
            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            $img = $manager->read($image);
            $img->scale(width: 800);

            $storagePath = storage_path('app/public/product-sets');
            if (!\Illuminate\Support\Facades\File::exists($storagePath)) {
                \Illuminate\Support\Facades\File::makeDirectory($storagePath, 0755, true);
            }

            $img->toWebp(quality: 80)->save(storage_path('app/public/' . $path));
            $validated['image_path'] = '/storage/' . $path;
        }

        $productSet = ProductSet::create($validated);
        return response()->json($productSet, 201);
    }

    public function update(Request $request, ProductSet $productSet)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'required|numeric|min:0',
            'hsn_code' => 'nullable|string|max:20',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($productSet->image_path) {
                $oldPath = str_replace('/storage/', '', $productSet->image_path);
                if (\Illuminate\Support\Facades\Storage::disk('public')->exists($oldPath)) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
                }
            }

            $image = $request->file('image');
            $filename = $productSet->sku . '-' . time() . '.webp';
            $path = 'product-sets/' . $filename;

            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            $img = $manager->read($image);
            $img->scale(width: 800);

            $storagePath = storage_path('app/public/product-sets');
            if (!\Illuminate\Support\Facades\File::exists($storagePath)) {
                \Illuminate\Support\Facades\File::makeDirectory($storagePath, 0755, true);
            }

            $img->toWebp(quality: 80)->save(storage_path('app/public/' . $path));
            $validated['image_path'] = '/storage/' . $path;
        }

        $productSet->update($validated);
        return response()->json($productSet);
    }

    public function destroy(ProductSet $productSet)
    {
        if ($productSet->image_path) {
            $oldPath = str_replace('/storage/', '', $productSet->image_path);
            if (\Illuminate\Support\Facades\Storage::disk('public')->exists($oldPath)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
        }
        
        $productSet->delete();
        return response()->json(['message' => 'Product Set deleted successfully']);
    }
}
