<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Attar;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

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

        return Inertia::render('Attars/Index', [
            'attars' => $attars,
            'filters' => [
                'search' => $search,
            ]
        ]);
    }

    public function create()
    {
        return Inertia::render('Attars/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'required|numeric|min:0',
            'hsn_code' => 'nullable|string|max:20',
            'image' => 'nullable|image|max:6048',
        ]);

        // Auto-generate SKU from name
        $sku = \Illuminate\Support\Str::slug($validated['name']);
        
        // Ensure SKU is unique
        $originalSku = $sku;
        $counter = 1;
        while (Attar::where('sku', $sku)->exists()) {
            $sku = $originalSku . '-' . $counter;
            $counter++;
        }
        $validated['sku'] = $sku;

        // Handle Image Upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = $sku . '-' . time() . '.webp';
            $path = 'attars/' . $filename;

            // Resize and convert to WebP
            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            $img = $manager->read($image);
            $img->scale(width: 800);

            $storagePath = storage_path('app/public/attars');
            if (!File::exists($storagePath)) {
                File::makeDirectory($storagePath, 0755, true);
            }

            $img->toWebp(quality: 80)->save(storage_path('app/public/' . $path));

            $validated['image_path'] = '/storage/' . $path;
        }

        Attar::create($validated);

        return redirect()->route('attars.index');
    }

    public function edit(Attar $attar)
    {
        return Inertia::render('Attars/Edit', [
            'attar' => $attar
        ]);
    }

    public function update(Request $request, Attar $attar)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'required|numeric|min:0',
            'hsn_code' => 'nullable|string|max:20',
            'image' => 'nullable|image|max:6048',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($attar->image_path) {
                $oldPath = str_replace('/storage/', '', $attar->image_path);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $image = $request->file('image');
            $filename = $attar->sku . '-' . time() . '.webp';
            $path = 'attars/' . $filename;

            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
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

        return redirect()->route('attars.index');
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

        return redirect()->route('attars.index');
    }
}
