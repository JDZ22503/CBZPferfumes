<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{-- Inline script to detect system dark mode preference and apply it immediately --}}
    <script>
        (function() {
            const appearance = '{{ $appearance ?? 'system' }}';

            if (appearance === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                }
            }
        })();
    </script>

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }
    </style>

    <title inertia>{{ config('app.name', 'Laravel') }}</title>
    <meta name="description"
        content="CBZ Perfumes - Exceptional luxury fragrances, attars, and gift sets. Handcrafted with rare ingredients for a timeless presence.">
    <meta name="keywords"
        content="perfumes, luxury fragrance, attars, gift sets, CBZ Perfumes, long lasting perfume, niche perfume">
    <meta name="author" content="CBZ Perfumes">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:title" content="CBZ Perfumes - Elegance in Every Drop">
    <meta property="og:description"
        content="Discover the art of fine fragrance with CBZ Perfumes. Exceptional luxury scents handcrafted for the contemporary connoisseur.">
    <meta property="og:image" content="{{ asset('images/og-image.jpg') }}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="{{ url()->current() }}">
    <meta property="twitter:title" content="CBZ Perfumes - Elegance in Every Drop">
    <meta property="twitter:description"
        content="Discover the art of fine fragrance with CBZ Perfumes. Exceptional luxury scents handcrafted for the contemporary connoisseur.">
    <meta property="twitter:image" content="{{ asset('images/og-image.jpg') }}">

    <!-- Site Name for Google Search -->
    <meta property="og:site_name" content="{{ config('app.name') }}">
    <meta property="og:title" content="{{ config('app.name') }}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">

    <script type="application/ld+json">
        {
          "@@context": "https://schema.org",
          "@@type": "WebSite",
          "name": "{{ config('app.name') }}",
          "url": "{{ config('app.url') }}",
          "logo": "{{ asset('favicon.png') }}"
        }
        </script>

    <link rel="icon" href="/favicon.png" type="image/png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

    @viteReactRefresh
    @routes
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>
