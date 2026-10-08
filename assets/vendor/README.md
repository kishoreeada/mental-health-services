# Local dependencies

Pages load the dependencies they need locally, without runtime dependence on third-party CDNs. Distribution contents and license notices are retained. GSAP and ScrollTrigger are in `gsap/`, AOS is in `aos/`, fonts are in `fonts/`, and redistribution licenses are in `licenses/`.

- GSAP 3.12.5 and ScrollTrigger 3.12.5: downloaded unchanged from cdnjs. Copyright and licensing references remain in their distribution headers.
- AOS 2.3.1: downloaded unchanged from unpkg. MIT license included.
- Font Awesome Free 6.5.2: CSS and three WOFF2 font files from cdnjs. License included.
- Manrope (400, 600, 700, 800) and Playfair Display (500, 600, italic 500): files obtained through the Google Fonts stylesheet and hosted locally. SIL Open Font Licenses included.

The local `fonts/fonts.css` preserves the existing typeface and weight choices. Font binaries now have descriptive filenames; their contents are unchanged. Keep the license files with redistributed assets.

The original Font Awesome CSS includes optional TTF and legacy v4-compatibility fallback declarations whose files were not part of the original project. The site uses the existing WOFF2 families. Upstream declarations are preserved rather than rewriting third-party distribution code during a structure-only cleanup.
