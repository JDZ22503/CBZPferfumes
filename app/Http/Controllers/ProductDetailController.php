<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ProductDetailController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $query = ProductDetail::with('product')->latest();

        if ($search) {
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        return Inertia::render('ProductDetails/Index', [
            'details' => $query->paginate(10),
            'filters' => ['search' => $search],
        ]);
    }

    public function create()
    {
        // Get products that don't have details yet
        $products = Product::whereDoesntHave('productDetail')->get();
        return Inertia::render('ProductDetails/Create', [
            'products' => $products
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id|unique:product_details,product_id',
            'description' => 'nullable|string',
            'top_notes' => 'nullable|string|max:255',
            'heart_notes' => 'nullable|string|max:255',
            'base_notes' => 'nullable|string|max:255',
            'images.*' => 'nullable|image|max:10240',
            'is_active' => 'nullable|boolean',
        ]);

        $product = Product::findOrFail($validated['product_id']);
        $imagePaths = [];

        if ($request->hasFile('images')) {
            $manager = new ImageManager(new Driver());
            foreach ($request->file('images') as $index => $image) {
                $filename = $product->sku . '-gallery-' . $index . '-' . time() . '.webp';
                $path = 'products/gallery/' . $filename;
                
                $img = $manager->read($image);
                $img->scale(width: 1200);

                $storagePath = storage_path('app/public/products/gallery');
                if (!File::exists($storagePath)) {
                    File::makeDirectory($storagePath, 0755, true);
                }

                $img->toWebp(quality: 80)->save(storage_path('app/public/' . $path));
                $imagePaths[] = '/storage/' . $path;
            }
        }

        ProductDetail::create([
            'product_id' => $validated['product_id'],
            'description' => $validated['description'],
            'top_notes' => $validated['top_notes'],
            'heart_notes' => $validated['heart_notes'],
            'base_notes' => $validated['base_notes'],
            'images' => $imagePaths,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('product-details.index')->with('success', 'Product details created successfully.');
    }

    public function edit(ProductDetail $productDetail)
    {
        $productDetail->load('product');
        return Inertia::render('ProductDetails/Edit', [
            'detail' => $productDetail
        ]);
    }

    public function update(Request $request, ProductDetail $productDetail)
    {
        $validated = $request->validate([
            'description' => 'nullable|string',
            'top_notes' => 'nullable|string|max:255',
            'heart_notes' => 'nullable|string|max:255',
            'base_notes' => 'nullable|string|max:255',
            'new_images.*' => 'nullable|image|max:10240',
            'existing_images' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $imagePaths = $request->input('existing_images', []);
        
        // Handle image deletions (images that were in the record but not in the submitted existing_images)
        $currentImages = $productDetail->images ?? [];
        $deletedImages = array_diff($currentImages, $imagePaths);
        foreach ($deletedImages as $deletedImage) {
            $path = str_replace('/storage/', '', $deletedImage);
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        if ($request->hasFile('new_images')) {
            $manager = new ImageManager(new Driver());
            $product = $productDetail->product;
            foreach ($request->file('new_images') as $index => $image) {
                $filename = $product->sku . '-gallery-new-' . $index . '-' . time() . '.webp';
                $path = 'products/gallery/' . $filename;
                
                $img = $manager->read($image);
                $img->scale(width: 1200);

                $storagePath = storage_path('app/public/products/gallery');
                if (!File::exists($storagePath)) {
                    File::makeDirectory($storagePath, 0755, true);
                }

                $img->toWebp(quality: 80)->save(storage_path('app/public/' . $path));
                $imagePaths[] = '/storage/' . $path;
            }
        }

        $productDetail->update([
            'description' => $validated['description'],
            'top_notes' => $validated['top_notes'],
            'heart_notes' => $validated['heart_notes'],
            'base_notes' => $validated['base_notes'],
            'images' => $imagePaths,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('product-details.index')->with('success', 'Product details updated successfully.');
    }

    public function destroy(ProductDetail $productDetail)
    {
        if ($productDetail->images) {
            foreach ($productDetail->images as $image) {
                $path = str_replace('/storage/', '', $image);
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        }
        $productDetail->delete();
    }

    public function toggleStatus(ProductDetail $productDetail)
    {
        $productDetail->update([
            'is_active' => !$productDetail->is_active
        ]);

        return back()->with('success', 'Status updated successfully.');
    }

    public function toggleFeatured(ProductDetail $productDetail)
    {
        $productDetail->update([
            'is_featured' => !$productDetail->is_featured
        ]);

        return back()->with('success', 'Featured status updated successfully.');
    }
}
