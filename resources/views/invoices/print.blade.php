<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Tax Invoice #{{ str_pad($order->id, 5, '0', STR_PAD_LEFT) }}</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10px; /* Reduced to 10px to fit more */
            margin: 0;
            padding: 10px;
            background: #e0e0e0; /* Gray background for web view contrast */
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
        }
        .invoice-wrapper {
            width: 210mm;
            height: 275mm; /* Reduced to strictly fit A4 with massive safety margin */
            padding: 5mm; 
            margin: 0; 
            background: white;
            box-sizing: border-box;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            overflow: hidden; 
            page-break-inside: avoid;
            page-break-after: avoid;
            page-break-before: avoid;
        }
        .invoice-container {
            width: 100%;
            height: 100%; /* Fill the wrapper */
            border: 1px solid #000;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-sizing: border-box;
            padding: 2px;
        }
        .header, .details, .items, .total-table, .footer {
            width: 100%;
            border-collapse: collapse;
        }
        td, th {
            border: 1px solid #000;
            padding: 4px;
            vertical-align: top;
        }
        .no-border-table td { border: none; }
        .no-border, .no-border td { border: none !important; }
        .left { text-align: left; }
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .title { font-size: 16px; font-weight: bold; text-transform: uppercase; }
        .small { font-size: 10px; }
        
        .terms-box {
            border-top: 1px solid #000;
            padding: 5px;
            font-size: 10px;
        }

        /* Items table flex grow */
        .items-container {
            flex: 1;
            /* border-bottom: 1px solid #000; */
        }
        
        @media print {
            body { background: white; margin: 0; padding: 0; }
            .no-print { display: none; }
            .invoice-wrapper { 
                width: 100%; 
                height: 275mm !important; /* Force height in print too */
                margin: 0; 
                padding: 5mm; 
                box-shadow: none;
                page-break-inside: avoid;
            }
            .invoice-container { 
                height: 100% !important; 
            }
        }
    </style>
</head>
<body>

<div class="no-print" style="text-align: center; margin-bottom: 20px;">
    <button id="download-pdf" style="padding: 10px 20px; background-color: #4f46e5; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
        Download PDF
    </button>
</div>

<div class="invoice-wrapper" id="invoice-content">
    <div class="invoice-container">
        <!-- TOP SECTION -->
        <div class="items-container">
            <!-- HEADER -->
            <table class="header">
                <tr>
                    <td class="left no-border" width="40%">
                        @if(!empty($settings['company_logo']))
                            <img src="{{ asset($settings['company_logo']) }}" alt="Logo" style="max-height: 50px; margin-bottom: 5px;"><br>
                        @else
                             <div style="font-size: 24px; font-weight: bold; font-style: italic;">CBZ</div>
                        @endif
                        <div style="font-weight: bold; font-size: 12px; margin-top: 5px;">{{ $settings['company_name'] ?? 'PERFUME ZONE' }}</div>
                        <div class="small" style="max-width: 250px;">
                            {{ $settings['company_address'] ?? '"PERFUME ZONE", Sorathiyawadi, Kothariya main road, Nr. Bahuchar Pan, Rajkot-360002' }}<br>
                            <strong>GSTIN :</strong> {{ $settings['company_gstin'] ?? '24AAPZ5173G1ZD' }}
                        </div>
                    </td>

                    <td class="center no-border" width="20%">
                        <div class="title">TAX INVOICE</div>
                        <div class="small">Cash Memo</div>
                        <div class="bold">ORIGINAL</div>
                    </td>

                    <td class="left no-border" width="40%">
                        <div class="bold">M/s {{ strtoupper($order->party->name) }}.</div>
                        <div class="small">
                            {{ $order->party->address }}<br>
                            Mobile No : {{ $order->party->phone ?? '-' }}<br>
                            <strong>GSTIN :</strong> {{ $order->party->gst_no ?? '-' }}
                        </div>
                    </td>
                </tr>
            </table>

            <!-- INVOICE META -->
            <table class="details" style="border-top: 1px solid #000;">
                <tr>
                    <td class="left" width="50%" style="border-right: 1px solid #000;">
                        <strong>Invoice No :</strong> {{ str_pad($order->id, 5, '0', STR_PAD_LEFT) }}
                    </td>
                    <td class="left" width="25%" style="border-right: 1px solid #000;">
                        <strong>Date :</strong> {{ $order->created_at->format('d/m/Y') }}
                    </td>
                    <td class="left" width="25%">
                        <strong>PAN No :</strong> -
                    </td>
                </tr>
            </table>

            <!-- ITEMS TABLE -->
            <table class="items" style="margin-top: -1px;">
                <thead>
                    <tr style="background-color: #f9f9f9;">
                        <th width="3%">Co.</th>
                        <th class="left" width="27%">Particular</th>
                        <th width="6%">HSN</th>
                        <th width="7%">MRP</th>
                        <th width="5%">Qty</th>
                        <th width="4%">Free</th>
                        <th width="5%">RT/RP</th>
                        <th width="7%">Rate</th>
                        <th width="4%">Sch.</th>
                        <th width="4%">Disc.</th>
                        <th width="4%">GST</th>
                        <th width="6%">CGST</th>
                        <th width="6%">SGST</th>
                        <th width="12%">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @php
                        $gstRate = (float)($settings['gst_rate'] ?? 18);
                        $defaultFree = $settings['default_free'] ?? '';
                        $defaultRtRp = $settings['default_rt_rp'] ?? '';
                        $defaultScheme = $settings['default_scheme'] ?? '';
                        $defaultDiscount = $settings['default_discount'] ?? '';

                        $totalTaxable = 0;
                        $totalCGST = 0;
                        $totalSGST = 0;
                        $grandTotal = 0;
                    @endphp
                    @foreach($order->items as $item)
                        @php
                            $isSet = $item->product_set_id ? true : false;
                            $isAttar = $item->attar_id ? true : false;
                            $product = $item->product ?? $item->productSet ?? $item->attar;
                            $name = $product ? $product->name : $item->product_name; 
                            
                            $discPercent = (float)$defaultDiscount;
                            $rate = (float)($item->unit_price ?? 0); 
                            $grossAmount = $rate * $item->quantity;
                            
                            $discountAmount = 0;
                            if ($discPercent > 0) {
                                $discountAmount = $grossAmount * ($discPercent / 100);
                            }
                            
                            $taxable = $grossAmount - $discountAmount;
                            
                            // GST Calculation
                            $gstAmount = $taxable * ($gstRate / 100);
                            $cgst = $gstAmount / 2;
                            $sgst = $gstAmount / 2;
                            
                            $lineTotal = $taxable + $gstAmount;

                            $totalTaxable += $taxable;
                            $totalCGST += $cgst;
                            $totalSGST += $sgst;
                            $grandTotal += $lineTotal;
                            
                            $mrp = optional($product)->price ?? 0;
                            $hsn = optional($product)->hsn_code ?? '33030050'; // Default per image
                        @endphp
                        <tr>
                            <td class="center">{{ $loop->iteration }}</td>
                            <td class="left">{{ $name }} {{ $isSet ? '(Set)' : ($isAttar ? '(Attar)' : '') }}</td>
                            <td class="center">{{ $hsn }}</td>
                            <td class="right">{{ number_format($mrp, 2) }}</td>
                            <td class="center">{{ $item->quantity }}</td>
                            <td class="center">{{ $defaultFree }}</td>
                            <td class="center">{{ $defaultRtRp }}</td>
                            <td class="right">{{ number_format($rate, 2) }}</td>
                            <td class="center">{{ $defaultScheme }}</td>
                            <td class="center">{{ $discPercent != 0 ? $discPercent.'%' : '' }}</td>
                            <td class="center">{{ $gstRate }}%</td>
                            <td class="right">{{ number_format($cgst, 2) }}</td>
                            <td class="right">{{ number_format($sgst, 2) }}</td>
                            <td class="right">{{ number_format($lineTotal, 2) }}</td>
                        </tr>
                    @endforeach
                    <!-- Fill empty rows if needed for alignment -->
                </tbody>
            </table>
        </div>

        <!-- BOTTOM SECTION -->
        <div class="footer-section">
            <table class="total-table" style="width: 100%; border-top: 1px solid #000;">
                <tr>
                    <!-- LEFT COLUMN: GST + Bank -->
                    <td width="60%" style="padding: 0; vertical-align: top; border-right: 1px solid #000; border-top: none;">
                        <table style="width: 100%; border-collapse: collapse; border: none;">
                            <tr>
                                <td colspan="4" class="left bold small" style="border: none; border-bottom: 1px solid #000; padding: 2px 4px;">GST Summary</td>
                            </tr>
                            <tr class="small bold center">
                                <td style="border: none; border-right: 1px solid #000; border-bottom: 1px solid #000;">Sales %</td>
                                <td style="border: none; border-right: 1px solid #000; border-bottom: 1px solid #000;">Taxable Amount</td>
                                <td style="border: none; border-right: 1px solid #000; border-bottom: 1px solid #000;">SGST</td>
                                <td style="border: none; border-bottom: 1px solid #000;">CGST</td>
                            </tr>
                            <tr class="small center">
                                <td style="border: none; border-right: 1px solid #000; border-bottom: 1px solid #000;">Sales {{ $gstRate }}%</td>
                                <td style="border: none; border-right: 1px solid #000; border-bottom: 1px solid #000;">{{ number_format($totalTaxable, 2) }}</td>
                                <td style="border: none; border-right: 1px solid #000; border-bottom: 1px solid #000;">{{ number_format($totalSGST, 2) }}</td>
                                <td style="border: none; border-bottom: 1px solid #000;">{{ number_format($totalCGST, 2) }}</td>
                            </tr>
                            <tr class="small bold center">
                                <td style="border: none; border-right: 1px solid #000;">Total</td>
                                <td style="border: none; border-right: 1px solid #000;">{{ number_format($totalTaxable, 2) }}</td>
                                <td style="border: none; border-right: 1px solid #000;">{{ number_format($totalSGST, 2) }}</td>
                                <td style="border: none;">{{ number_format($totalCGST, 2) }}</td>
                            </tr>
                        </table>
                        
                        <div style="padding: 5px; border-top: 1px solid #000;">
                            <span class="bold small">Rs. Apx :</span>
                            <span class="small">Rs. {{ number_format($grandTotal, 2) }}</span>
                        </div>

                        <div style="padding: 5px; border-top: 1px solid #000; height: 80px;">
                            <div class="bold small" style="text-decoration: underline;">Bank Details:</div>
                            <div class="small">
                                <strong>Bank :</strong> {{ $settings['bank_name'] ?? 'Vijay Commercial Co-operative Bank' }}<br>
                                <strong>A/C No :</strong> {{ $settings['bank_account_no'] ?? '003002600000214' }}<br>
                                <strong>IFSC :</strong> {{ $settings['bank_ifsc'] ?? 'KVCC003' }}
                            </div>
                        </div>
                    </td>
                    
                    <!-- RIGHT COLUMN: Totals + QR + Sign -->
                    <td width="40%" style="padding: 0; vertical-align: top; border-top: none;">
                         <table style="width: 100%; border-collapse: collapse; border: none;">
                            <tr>
                                <td class="right bold small" style="border: none; border-bottom: 1px solid #000; padding: 2px 5px;">Sub Total</td>
                                <td class="right bold small" style="border: none; border-bottom: 1px solid #000; border-left: 1px solid #000; padding: 2px 5px;">{{ number_format($grandTotal, 2) }}</td>
                            </tr>
                             <tr>
                                <td class="right small" style="border: none; border-bottom: 1px solid #000; padding: 2px 5px;">Round Off</td>
                                <td class="right small" style="border: none; border-bottom: 1px solid #000; border-left: 1px solid #000; padding: 2px 5px;">0.00</td>
                            </tr>
                             <tr>
                                <td class="right bold small" style="border: none; padding: 5px;">Grand Total ₹</td>
                                <td class="right bold small" style="border: none; border-left: 1px solid #000; padding: 5px;">{{ number_format($grandTotal, 2) }}</td>
                            </tr>
                        </table>
                        
                        <div style="border-top: 1px solid #000; display: flex; height: 100px;">
                            <div style="flex: 1; padding: 5px; display: flex; align-items: center; justify-content: center;">
                                <!-- QR Placeholder -->
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data={{ url('/orders/'.$order->id) }}" alt="Scan URL" style="width: 80px; height: 80px;">
                                <div class="small center" style="margin-top:2px;">Scan to Pay</div>
                            </div>
                            <div style="flex: 1.5; text-align: right; padding: 5px; display: flex; flex-direction: column; justify-content: space-between;">
                                 <div class="small">For {{ $settings['company_name'] ?? 'PERFUME ZONE' }}</div>
                                 <div class="bold small">Authorised Signatory</div>
                            </div>
                        </div>
                    </td>
                </tr>
            </table>
        
            <div class="terms-box">
                <div class="bold small" style="margin-bottom: 2px;">Terms & Conditions</div>
                <div class="small">
                    @php
                        $terms = $settings['invoice_terms'] ?? '';
                        if (empty($terms)) {
                            $terms = "Subject to RAJKOT jurisdiction.\nPayment Condition Seven Day/Cheque Return Charges 200 is added in next invoice E. & O. E.";
                        }
                    @endphp
                    {!! nl2br(e($terms)) !!}
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
<script>
    document.getElementById('download-pdf').addEventListener('click', function() {
        var element = document.getElementById('invoice-content');
        var opt = {
            margin:       0,
            filename:     'invoice_{{ $order->id }}.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, letterRendering: true, scrollX: 0, scrollY: 0 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    });
</script>
</body>
</html>
