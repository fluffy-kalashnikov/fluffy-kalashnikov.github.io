# Project Cards
Every project card should have at least 2 1920x1080 screenshots 
downsampled to 512x288 (1920/512 = 3.75). Every project should
have a short list with all responsibilities across disciplines.
# Resume
Resume should be visible on the page without downloading. There should be a link above to download the PDF to disk, and the PDF should be named Ivar Sidorsson Resume.pdf to accomodate the Ivar Sidorsson Cover Letter.pdf better. The Resume should be in PDF format for cross platform compatibility with Linux as Microsoft can fuck themselves.

Converting PDF to WEBP
```
scoop install ffmpeg
scoop install poppler
pdftoppm file.pdf
ffmpeg -i file.ppm file.webp
```