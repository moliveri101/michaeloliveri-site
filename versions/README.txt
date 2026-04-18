SAVED VERSIONS
==============

Each subfolder is a full snapshot of index.html, style.css, and main.js at a
specific moment. To restore a version, copy its three files back over the
root copies (or ask the assistant: "restore the <name> version").

strobe/  ---  Main page is an auto-starting 2.2s black/white strobe that
              lands on a random image for 1.8s, with a fluorescent orange
              "PHOTOSENSITIVITY WARNING" overlay visible only during flash.

color/   ---  Main page alternates a yellow-lime fluorescent color patch
              with a random image. The patch is sized to match the exact
              area the incoming image will occupy (object-fit: contain).
              No strobe, no warning text.
