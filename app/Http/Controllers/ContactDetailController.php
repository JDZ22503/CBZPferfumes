<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ContactDetail;
use Inertia\Inertia;

class ContactDetailController extends Controller
{
    /**
     * Display a listing of the contact details.
     */
    public function index()
    {
        $contact = ContactDetail::first();

        return Inertia::render('ContactDetails/Index', [
            'contact_email' => $contact->email ?? '',
            'contact_phone' => $contact->phone ?? '',
            'contact_address' => $contact->address ?? '',
            'instagram_link' => $contact->instagram_link ?? '',
            'whatsapp_link' => $contact->whatsapp_link ?? '',
            'facebook_link' => $contact->facebook_link ?? '',
        ]);
    }

    /**
     * Update the specified contact details in storage.
     */
    public function update(Request $request)
    {
        $request->validate([
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'required|string|max:20',
            'contact_address' => 'required|string|max:500',
            'instagram_link' => 'nullable|url|max:255',
            'whatsapp_link' => 'nullable|url|max:255',
            'facebook_link' => 'nullable|url|max:255',
        ]);

        ContactDetail::updateOrCreate(
            ['id' => 1],
            [
                'email' => $request->contact_email,
                'phone' => $request->contact_phone,
                'address' => $request->contact_address,
                'instagram_link' => $request->instagram_link,
                'whatsapp_link' => $request->whatsapp_link,
                'facebook_link' => $request->facebook_link,
            ]
        );

        return redirect()->back()->with('success', 'Contact details updated successfully.');
    }
}
