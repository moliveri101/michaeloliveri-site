IMAGES
======

One folder per menu section. Drop JPG / PNG / WebP files in the matching folder.

Folders
-------
home/          Up to 25 images for the strobe sequence on the landing page.
sculpture/     Gallery for the Sculpture section.
installation/  Gallery for the Installation section.
sound-light/   Gallery for the Sound / Light section.
photography/   Gallery for the Photography section.
bio/           Portrait, studio shots, etc. for the Bio / CV page.

File recommendations
--------------------
Format:     JPG (photos) or WebP. PNG only if you need transparency.
Size:       1600 px wide max, sRGB color, 75-85 quality.
Naming:     lowercase, hyphens, no spaces.
              good:  neon-field-2022-01.jpg
              bad:   Neon Field (2022) #1.JPG

Wiring into HTML
----------------
Strobe (home):
  In main.js, each slot's <div class="ph"> can be replaced with:
    <img src="images/home/filename.jpg" alt="">
  Or hand me the filenames and I'll wire them up.

Section galleries (sculpture / installation / etc.):
  In index.html, find the <figure> blocks in that section and swap:
    <div class="placeholder">image</div>
  for:
    <img src="images/sculpture/filename.jpg" alt="short description">
  Then update <figcaption> with the real title and year.
