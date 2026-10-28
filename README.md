# Vortex

A website for buying and selling 3D printed toys.

Live site: https://peevadaniela-oss.github.io/vortex-site/

## Adding photos

Put photos in the `images/` folder (JPG, about 1000px wide is plenty).

- **Home page gallery** ("Made with your name"): copy one of the `<figure>` lines in `index.html` and change the file name, alt text and caption.
- **Hover previews** on the home page toy list: add `data-photo="images/your-photo.jpg"` to the toy's link in `index.html`.
- **Placeholders** (dashed boxes, e.g. the home hero, the printer photo and the About me photo): replace `<div class="ph">…</div>` with `<img class="photo" src="images/your-photo.jpg" alt="…">`.
