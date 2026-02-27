<?php

namespace App\Http\Controllers;

use App\Models\Attar;
use App\Models\AttarDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class AttarDetailController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $query = AttarDetail::with('attar')->latest();

        if ($search) {
            $query->whereHas('attar', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        return Inertia::render('AttarDetails/Index', [
            'details' => $query->paginate(10),
            'filters' => ['search' => $search],
        ]);
    }

    public function create()
    {
        $attars = Attar::whereDoesntHave('attarDetail')->get();
        return Inertia::render('AttarDetails/Create', [
            'attars' => $attars
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'attar_id' => 'required|exists:attars,id|unique:attar_details,attar_id',
            'description' => 'nullable|string',
            'top_notes' => 'nullable|string|max:255',
            'heart_notes' => 'nullable|string|max:255',
            'base_notes' => 'nullable|string|max:255',
            'images.*' => 'nullable|image|max:10240',
            'is_active' => 'nullable|boolean',
        ]);

        $attar = Attar::findOrFail($validated['attar_id']);
        $imagePaths = [];

        if ($request->hasFile('images')) {
            $manager = new ImageManager(new Driver());
            foreach ($request->file('images') as $index => $image) {
                $filename = $attar->sku . '-gallery-' . $index . '-' . time() . '.webp';
                $path = 'attars/gallery/' . $filename;
                
                $img = $manager->read($image);
                $img->scale(width: 1200);

                $storagePath = storage_path('app/public/attars/gallery');
                if (!File::exists($storagePath)) {
                    File::makeDirectory($storagePath, 0755, true);
                }

                $img->toWebp(quality: 80)->save(storage_path('app/public/' . $path));
                $imagePaths[] = '/storage/' . $path;
            }
        }

        AttarDetail::create([
            'attar_id' => $validated['attar_id'],
            'description' => $validated['description'],
            'top_notes' => $validated['top_notes'],
            'heart_notes' => $validated['heart_notes'],
            'base_notes' => $validated['base_notes'],
            'images' => $imagePaths,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('attar-details.index')->with('success', 'Attar details created successfully.');
    }

    public function edit(AttarDetail $attarDetail)
    {
        $attarDetail->load('attar');
        return Inertia::render('AttarDetails/Edit', [
            'detail' => $attarDetail
        ]);
    }

    public function update(Request $request, AttarDetail $attarDetail)
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
        
        $currentImages = $attarDetail->images ?? [];
        $deletedImages = array_diff($currentImages, $imagePaths);
        foreach ($deletedImages as $deletedImage) {
            $path = str_replace('/storage/', '', $deletedImage);
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        if ($request->hasFile('new_images')) {
            $manager = new ImageManager(new Driver());
            $attar = $attarDetail->attar;
            foreach ($request->file('new_images') as $index => $image) {
                $filename = $attar->sku . '-gallery-new-' . $index . '-' . time() . '.webp';
                $path = 'attars/gallery/' . $filename;
                
                $img = $manager->read($image);
                $img->scale(width: 1200);

                $storagePath = storage_path('app/public/attars/gallery');
                if (!File::exists($storagePath)) {
                    File::makeDirectory($storagePath, 0755, true);
                }

                $img->toWebp(quality: 80)->save(storage_path('app/public/' . $path));
                $imagePaths[] = '/storage/' . $path;
            }
        }

        $attarDetail->update([
            'description' => $validated['description'],
            'top_notes' => $validated['top_notes'],
            'heart_notes' => $validated['heart_notes'],
            'base_notes' => $validated['base_notes'],
            'images' => $imagePaths,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('attar-details.index')->with('success', 'Attar details updated successfully.');
    }

    public function destroy(AttarDetail $attarDetail)
    {
        if ($attarDetail->images) {
            foreach ($attarDetail->images as $image) {
                $path = str_replace('/storage/', '', $image);
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        }
        $attarDetail->delete();
        return redirect()->route('attar-details.index')->with('success', 'Attar details deleted successfully.');
    }
    
    public function toggleStatus(AttarDetail $attarDetail)
    {
        $attarDetail->update([
            'is_active' => !$attarDetail->is_active
        ]);

        return back()->with('success', 'Status updated successfully.');
    }

    public function toggleFeatured(AttarDetail $attarDetail)
    {
        $attarDetail->update([
            'is_featured' => !$attarDetail->is_featured
        ]);

        return back()->with('success', 'Featured status updated successfully.');
    }
}
