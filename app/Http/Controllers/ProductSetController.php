<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\ProductSet;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Storage;

class ProductSetController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');

        $query = ProductSet::latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $productSets = $query->paginate(10);

        return Inertia::render('ProductSets/Index', [
            'productSets' => $productSets,
            'filters' => [
                'search' => $search,
            ]
        ]);
    }

    public function create()
    {
        return Inertia::render('ProductSets/Create');
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

        $sku = Str::slug($validated['name']);
        
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
            if (!File::exists($storagePath)) {
                File::makeDirectory($storagePath, 0755, true);
            }

            $img->toWebp(quality: 80)->save(storage_path('app/public/' . $path));

            $validated['image_path'] = '/storage/' . $path;
        }

        ProductSet::create($validated);

        return redirect()->route('product-sets.index');
    }

    public function edit(ProductSet $productSet)
    {
        return Inertia::render('ProductSets/Edit', [
            'productSet' => $productSet
        ]);
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
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $image = $request->file('image');
            $filename = $productSet->sku . '-' . time() . '.webp';
            $path = 'product-sets/' . $filename;

            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            $img = $manager->read($image);
            $img->scale(width: 800);

            $storagePath = storage_path('app/public/product-sets');
            if (!File::exists($storagePath)) {
                File::makeDirectory($storagePath, 0755, true);
            }

            $img->toWebp(quality: 80)->save(storage_path('app/public/' . $path));

            $validated['image_path'] = '/storage/' . $path;
        }

        $productSet->update($validated);

        return redirect()->route('product-sets.index');
    }

    public function destroy(ProductSet $productSet)
    {
        if ($productSet->image_path) {
            $oldPath = str_replace('/storage/', '', $productSet->image_path);
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }
        
        $productSet->delete();

        return redirect()->route('product-sets.index');
    }
}
