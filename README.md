# Pohjoisen Helmi Website

A simple static website for Pohjoisen Helmi, a Kuopio-based cleaning service. The project is built with plain HTML, CSS and JavaScript and includes a multilingual interface supported by localized JSON files.

## Project Overview

- `index.html` — home page with hero, services, protection and contact sections.
- `about.html` — company information and goals.
- `service.html` — service details and offerings.
- `tools.html` — tools and equipment information.
- `contact.html` — contact page with a form and direct contact details.
- `style.css` — global site styling and responsive layout rules.
- `script.js` — client-side behavior and interactions.
- `i18n.js` — localization loader for Finnish, English and Russian.
- `locales/` — translation files for supported languages.
- `images/`, `icons/`, `logo/` — static assets used throughout the site.

## Features

- Responsive layout optimized for desktop, tablet and mobile screens.
- Footer and contact sections with direct email, phone and map link.
- Multilingual support via `i18n.js` and locale JSON files.
- Lightweight static site with zero build step required.

## Setup and Usage

1. Open the project folder in your code editor.
2. Open any HTML page in a browser, for example `index.html`.
3. If you want a local preview server, use a simple static server such as VS Code Live Server or Python HTTP server:

```bash
# Python 3
cd /path/to/cleaning
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Localization

Translation files are stored in `locales/`:

- `locales/fi.json`
- `locales/en.json`
- `locales/ru.json`

The JavaScript file `i18n.js` loads the correct language from the page and replaces text placeholders with localized strings.



