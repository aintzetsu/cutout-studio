# Cutout Studio

Zero-dependency client-side background remover and matte cutout studio built with HTML5 `<canvas>`.

## Features
- **Auto Remove BG**: Perimeter palette sampling + contiguous edge flood-fill (plus optional enclosed hole clearing) with Tolerance and Edge Feather sliders.
- **Magic Wand & Global Color Key**: Click any region or hue on the canvas to isolate and remove matching pixels.
- **Manual Erase & Restore Brushes**: Non-destructive pixel restoration from the original buffer with 20-step Undo (`Ctrl+Z`).
- **Before / After Split Compare**: Interactive hairline divider comparing original vs. transparent cutout.
- **Backdrop Studio & PNG Export**: Preview on transparency checkerboard, studio gradients, custom solids, and optional cast drop shadow, then download transparent or composited PNG.
