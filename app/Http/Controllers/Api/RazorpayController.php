<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Razorpay\Api\Api;
use Exception;
use Illuminate\Support\Facades\Log;

class RazorpayController extends Controller
{
    private $api;

    public function __construct()
    {
        $this->api = new Api(
            env('RAZORPAY_KEY_ID'),
            env('RAZORPAY_KEY_SECRET')
        );
    }

    /**
     * Create a new Razorpay order.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createOrder(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer',
            'currency' => 'required|string|size:3',
            'receipt' => 'nullable|string|max:40',
        ]);

        try {         
            $notes = $request->input('notes', []);
            
            if (is_string($notes) && !empty($notes)) {
                $decoded = json_decode($notes, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $notes = $decoded;
                } else {
                    // If it's just a string, we ignore it and start fresh
                    $notes = [];
                }
            }

            if (!is_array($notes)) {
                $notes = [];
            }
            
            // Check for dot notation keys in all input
            foreach ($request->all() as $key => $value) {
                if (strpos($key, 'notes.') === 0) {
                    $notes[substr($key, 6)] = $value;
                }
            }

            $orderData = [
                'receipt'         => $request->receipt ?? 'rcpt_' . time(),
                'amount'          => $request->amount,
                'currency'        => $request->currency,
                'notes'           => (object)$notes, // Ensure it's sent as an object/associative array
                'partial_payment' => $request->boolean('partial_payment', false),
            ];

            if ($request->has('first_payment_min_amount')) {
                $orderData['first_payment_min_amount'] = $request->first_payment_min_amount;
            }

            Log::info('Creating Razorpay order with data:', $orderData);

            $razorpayOrder = $this->api->order->create($orderData);
            $orderArray = $razorpayOrder->toArray();

            return response()->json([
                'id' => $orderArray['id'],
                'amount' => $orderArray['amount'],
                'currency' => $orderArray['currency'],
                'receipt' => $orderArray['receipt'],
                'notes' => $orderArray['notes'],
            ]);
        } catch (Exception $e) {
            Log::error('Razorpay Order Creation Failed: ' . $e->getMessage(), [
                'request' => $request->all(),
                'exception' => $e
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create Razorpay order.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify Razorpay payment signature.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifySignature(Request $request)
    {
        $request->validate([
            'razorpay_order_id' => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature' => 'required|string',
        ]);

        try {
            $attributes = [
                'razorpay_order_id' => $request->razorpay_order_id,
                'razorpay_payment_id' => $request->razorpay_payment_id,
                'razorpay_signature' => $request->razorpay_signature
            ];

            $this->api->utility->verifyPaymentSignature($attributes);

            return response()->json([
                'success' => true,
                'message' => 'Payment signature verified successfully.',
            ]);
        } catch (Exception $e) {
            Log::error('Razorpay Signature Verification Failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Invalid payment signature.',
            ], 400);
        }
    }
}
