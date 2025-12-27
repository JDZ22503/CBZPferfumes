<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attar;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Illuminate\Support\Str;

class AttarController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $query = Attar::latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $attars = $query->paginate(10);
        return response()->json($attars);
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
        while (Attar::where('sku', $sku)->exists()) {
            $sku = $originalSku . '-' . $counter;
            $counter++;
        }
        $validated['sku'] = $sku;

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = $sku . '-' . time() . '.webp';
            $path = 'attars/' . $filename;
            
            $manager = new ImageManager(new Driver());
            $img = $manager->read($image);
            $img->scale(width: 800);

            $storagePath = storage_path('app/public/attars');
            if (!File::exists($storagePath)) {
                File::makeDirectory($storagePath, 0755, true);
            }

            $img->toWebp(quality: 80)->save(storage_path('app/public/' . $path));
            $validated['image_path'] = '/storage/' . $path;
        }

        $attar = Attar::create($validated);
        return response()->json($attar, 201);
    }

    public function show(Attar $attar)
    {
        return response()->json($attar);
    }

    public function update(Request $request, Attar $attar)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'required|numeric|min:0',
            'hsn_code' => 'nullable|string|max:20',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($attar->image_path) {
                $oldPath = str_replace('/storage/', '', $attar->image_path);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $image = $request->file('image');
            $filename = $attar->sku . '-' . time() . '.webp';
            $path = 'attars/' . $filename;

            $manager = new ImageManager(new Driver());
            $img = $manager->read($image);
            $img->scale(width: 800);

            $storagePath = storage_path('app/public/attars');
            if (!File::exists($storagePath)) {
                File::makeDirectory($storagePath, 0755, true);
            }

            $img->toWebp(quality: 80)->save(storage_path('app/public/' . $path));
            $validated['image_path'] = '/storage/' . $path;
        }

        $attar->update($validated);
        return response()->json($attar);
    }

    public function destroy(Attar $attar)
    {
        if ($attar->image_path) {
            $oldPath = str_replace('/storage/', '', $attar->image_path);
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }
        
        $attar->delete();
        return response()->json(['message' => 'Attar deleted successfully']);
    }
}
