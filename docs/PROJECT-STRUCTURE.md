# Project structure

This is a static website. No build step or package installation is required. Serve the project root with a static server, or open `index.html` for a local preview.

```text
stackly-mental-health/
├── *.html                        All 26 existing page URLs, unchanged
├── assets/
│   ├── css/
│   │   ├── base/site.css         Shared public-site styling
│   │   └── pages/               Page-specific stylesheets
│   ├── js/
│   │   ├── core/main.js         Shared public-site behavior
│   │   └── pages/               Page-specific behavior
│   ├── icons/                   Stackly logo and S favicon
│   ├── images/                  Referenced local WebP assets
│   └── vendor/
│       ├── aos/                 AOS distribution files
│       ├── gsap/                GSAP and ScrollTrigger
│       ├── fontawesome/         Original CSS and WOFF2 distributions
│       ├── fonts/               fonts.css and named font files
│       ├── licenses/            Required redistribution licenses
│       └── README.md            Dependency notes
├── docs/PROJECT-STRUCTURE.md
└── README.md                    Setup, routes and demo limitations
```

HTML entry points deliberately remain at the root. Moving them would change existing addresses, bookmarks, relative links, and login/dashboard routing.

## Modules

`about`, `auth`, `blog`, `contact`, `dashboard`, `home-finish`, `not-found`, and `services` have corresponding files in `assets/css/pages/` and `assets/js/pages/`.

- Public pages load shared styling and main behavior where needed.
- Login and Sign Up use the auth module; twelve workspace pages use the dashboard module; 404 uses the not-found module.
- Journal data needed by the browser is embedded in the HTML. The removed standalone JSON copy was not fetched or imported by the site.

## Maintenance

1. Keep page URLs stable unless intentionally planning a URL migration.
2. Keep page-specific CSS and JavaScript scoped to their respective modules.
3. Resolve stylesheet asset URLs relative to the stylesheet, not the HTML page.
4. Retain vendor copyright notices and required licenses.
5. Check HTML, inline data, JavaScript, CSS and font declarations before removing assets. An unlinked HTML page may still have a public URL.
6. Keep screenshots, backups, temporary tools and historical audits outside the deployed project.

## Cleanup scope

Ten unreferenced images, an unused standalone journal JSON copy, and four obsolete home-section audit documents were removed. Current page content, application logic, theme, displayed imagery and page URLs were preserved. Shared CSS was not aggressively pruned: selectors can be used by responsive states or JavaScript-generated elements.

Authentication and dashboards remain static demonstrations; see the root README for their security and integration boundaries.
