<?php

namespace App\Http\Controllers;

use App\Models\ProductSet;
use App\Models\ProductSetDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ProductSetDetailController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $query = ProductSetDetail::with('productSet')->latest();

        if ($search) {
            $query->whereHas('productSet', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        return Inertia::render('ProductSetDetails/Index', [
            'details' => $query->paginate(10),
            'filters' => ['search' => $search],
        ]);
    }

    public function create()
    {
        $productSets = ProductSet::whereDoesntHave('productSetDetail')->get();
        return Inertia::render('ProductSetDetails/Create', [
            'productSets' => $productSets
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_set_id' => 'required|exists:product_sets,id|unique:product_set_details,product_set_id',
            'description' => 'nullable|string',
            'top_notes' => 'nullable|string|max:255',
            'heart_notes' => 'nullable|string|max:255',
            'base_notes' => 'nullable|string|max:255',
            'images.*' => 'nullable|image|max:10240',
            'is_active' => 'nullable|boolean',
        ]);

        $productSet = ProductSet::findOrFail($validated['product_set_id']);
        $imagePaths = [];

        if ($request->hasFile('images')) {
            $manager = new ImageManager(new Driver());
            foreach ($request->file('images') as $index => $image) {
                $filename = $productSet->sku . '-gallery-' . $index . '-' . time() . '.webp';
                $path = 'product-sets/gallery/' . $filename;
                
                $img = $manager->read($image);
                $img->scale(width: 1200);

                $storagePath = storage_path('app/public/product-sets/gallery');
                if (!File::exists($storagePath)) {
                    File::makeDirectory($storagePath, 0755, true);
                }

                $img->toWebp(quality: 80)->save(storage_path('app/public/' . $path));
                $imagePaths[] = '/storage/' . $path;
            }
        }

        ProductSetDetail::create([
            'product_set_id' => $validated['product_set_id'],
            'description' => $validated['description'],
            'top_notes' => $validated['top_notes'],
            'heart_notes' => $validated['heart_notes'],
            'base_notes' => $validated['base_notes'],
            'images' => $imagePaths,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('gift-set-details.index')->with('success', 'Gift set details created successfully.');
    }

    public function edit(ProductSetDetail $gift_set_detail)
    {
        $gift_set_detail->load('productSet');
        return Inertia::render('ProductSetDetails/Edit', [
            'detail' => $gift_set_detail
        ]);
    }

    public function update(Request $request, ProductSetDetail $gift_set_detail)
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
        
        $currentImages = $gift_set_detail->images ?? [];
        $deletedImages = array_diff($currentImages, $imagePaths);
        foreach ($deletedImages as $deletedImage) {
            $path = str_replace('/storage/', '', $deletedImage);
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        if ($request->hasFile('new_images')) {
            $manager = new ImageManager(new Driver());
            $productSet = $gift_set_detail->productSet;
            foreach ($request->file('new_images') as $index => $image) {
                $filename = $productSet->sku . '-gallery-new-' . $index . '-' . time() . '.webp';
                $path = 'product-sets/gallery/' . $filename;
                
                $img = $manager->read($image);
                $img->scale(width: 1200);

                $storagePath = storage_path('app/public/product-sets/gallery');
                if (!File::exists($storagePath)) {
                    File::makeDirectory($storagePath, 0755, true);
                }

                $img->toWebp(quality: 80)->save(storage_path('app/public/' . $path));
                $imagePaths[] = '/storage/' . $path;
            }
        }

        $gift_set_detail->update([
            'description' => $validated['description'],
            'top_notes' => $validated['top_notes'],
            'heart_notes' => $validated['heart_notes'],
            'base_notes' => $validated['base_notes'],
            'images' => $imagePaths,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('gift-set-details.index')->with('success', 'Gift set details updated successfully.');
    }

    public function destroy(ProductSetDetail $gift_set_detail)
    {
        if ($gift_set_detail->images) {
            foreach ($gift_set_detail->images as $image) {
                $path = str_replace('/storage/', '', $image);
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        }
        $gift_set_detail->delete();
        return redirect()->route('gift-set-details.index')->with('success', 'Gift set details deleted successfully.');
    }

    public function toggleStatus(ProductSetDetail $gift_set_detail)
    {
        $gift_set_detail->update([
            'is_active' => !$gift_set_detail->is_active
        ]);

        return back()->with('success', 'Status updated successfully.');
    }

    public function toggleFeatured(ProductSetDetail $gift_set_detail)
    {
        $gift_set_detail->update([
            'is_featured' => !$gift_set_detail->is_featured
        ]);

        return back()->with('success', 'Featured status updated successfully.');
    }
}
