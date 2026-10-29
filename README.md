# Vortex

A website for buying and selling 3D printed toys.

Live site: https://peevadaniela-oss.github.io/vortex-site/

## Adding photos

Photos are kept in the Wix site's media manager and linked by their `https://static.wixstatic.com/media/...` address, so they work wherever the site is hosted. The `images/` folder keeps the originals.

- **Home page gallery** ("Made with your name"): copy one of the `<figure>` lines in `index.html` and change the address, alt text and caption.
- **Hover previews** on the home page toy list: add `data-photo="https://static.wixstatic.com/media/..."` to the toy's link in `index.html`.
- **Designer shapes**: set `photo` on the shape in `catalog.js`; it shows next to the 3D preview, on Create your own, and in the random pick on Home and Shop.
- **Placeholders** (dashed boxes, e.g. the printer photo and the About me photo): replace `<div class="ph">…</div>` with `<img class="photo" src="..." alt="…">`.
