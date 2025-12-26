<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Product;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');

        $query = Product::latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $products = $query->paginate(10);

        return Inertia::render('Products/Index', [
            'products' => $products,
            'filters' => [
                'search' => $search,
            ]
        ]);
    }

    public function create()
    {
        return Inertia::render('Products/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'required|numeric|min:0',
            'hsn_code' => 'nullable|string|max:20',
            'image' => 'nullable|image|max:6048', // Validate image file
        ]);

        // Auto-generate SKU from name
        $sku = \Illuminate\Support\Str::slug($validated['name']);
        
        // Ensure SKU is unique by appending a number if necessary
        $originalSku = $sku;
        $counter = 1;
        while (Product::where('sku', $sku)->exists()) {
            $sku = $originalSku . '-' . $counter;
            $counter++;
        }
        $validated['sku'] = $sku;

        // Handle Image Upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = $sku . '-' . time() . '.webp';
            $path = 'products/' . $filename;

            // Resize and convert to WebP
            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            $img = $manager->read($image);
            $img->scale(width: 800); // Resize to max width 800px, maintaining aspect ratio

            $storagePath = storage_path('app/public/products');
            if (!File::exists($storagePath)) {
                File::makeDirectory($storagePath, 0755, true);
            }

            $img->toWebp(quality: 80)->save(storage_path('app/public/' . $path));

            $validated['image_path'] = '/storage/' . $path;
        }

        Product::create($validated);

        return redirect()->route('products.index');
    }
    public function edit(Product $product)
    {
        return Inertia::render('Products/Edit', [
            'product' => $product
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'required|numeric|min:0',
            'hsn_code' => 'nullable|string|max:20',
            'image' => 'nullable|image|max:6048',
        ]);

        // If name changes, regenerate SKU? 
        // For now, let's keep SKU persistent or allow manual update if we add that field back.
        // But the requirement was auto-generate on create. Usually SKU shouldn't change easily.
        // Let's only update other fields for now. 
        // If user wants to update SKU, we might need logic, but for now let's stick to name/price/stock/image.

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image_path) {
                $oldPath = str_replace('/storage/', '', $product->image_path);
                if (\Illuminate\Support\Facades\Storage::disk('public')->exists($oldPath)) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
                }
            }

            $image = $request->file('image');
            $filename = $product->sku . '-' . time() . '.webp';
            $path = 'products/' . $filename;

            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            $img = $manager->read($image);
            $img->scale(width: 800);

            $storagePath = storage_path('app/public/products');
            if (!File::exists($storagePath)) {
                File::makeDirectory($storagePath, 0755, true);
            }

            $img->toWebp(quality: 80)->save(storage_path('app/public/' . $path));

            $validated['image_path'] = '/storage/' . $path;
        }

        $product->update($validated);

        return redirect()->route('products.index');
    }

    public function destroy(Product $product)
    {
        if ($product->image_path) {
            $oldPath = str_replace('/storage/', '', $product->image_path);
            if (\Illuminate\Support\Facades\Storage::disk('public')->exists($oldPath)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
        }
        
        $product->delete();

        return redirect()->route('products.index');
    }
}
