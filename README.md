Hritam Basak’s personal research website: https://hritam-98.github.io

Static HTML, CSS, and JavaScript, published by GitHub Pages from `main`.
There is no build step.

To preview locally:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000` in a browser.

- `index.html` contains the biography, updates, publications, and service.
- `css/site.css` defines the responsive light and dark themes.
- `js/site.js` enhances navigation, publication filters, citations, and dialogs.
- `js/hero-scene.js` contains the original decorative robot scene. It loads on
  wide screens; mobile, reduced-motion, JavaScript-disabled, and unavailable
  WebGL configurations retain a reading view. The 3D view includes pause and
  reading-view controls.
- `js/vendor/` contains the pinned Three.js runtime, text helpers, font, licenses,
  and source checksums. No third-party scene assets are used.
- `ResumeCV/Hritam_Basak_CV.pdf` is the current downloadable résumé. Keep this
  filename stable when replacing the document.
- `img/optimized/` contains WebP versions of the original portrait and figures.
  Publication image links still open their original full-resolution files.

