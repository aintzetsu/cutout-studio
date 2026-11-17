(function (global) {
  "use strict";

  function colorDistance(r1, g1, b1, r2, g2, b2) {
    // Weighted perceptual RGB Euclidean distance
    const rm = (r1 + r2) * 0.5;
    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;
    return Math.sqrt(
      (2 + rm / 256) * dr * dr +
      4 * dg * dg +
      (2 + (255 - rm) / 256) * db * db
    ) / 2.2;
  }

  function sampleBorderPalette(data, width, height) {
    const samples = [];
    const stepX = Math.max(1, Math.floor(width / 12));
    const stepY = Math.max(1, Math.floor(height / 12));

    const pushPixel = (x, y) => {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] < 20) return;
      samples.push([data[idx], data[idx + 1], data[idx + 2]]);
    };

    for (let x = 0; x < width; x += stepX) {
      pushPixel(x, 0);
      pushPixel(x, height - 1);
    }
    for (let y = 0; y < height; y += stepY) {
      pushPixel(0, y);
      pushPixel(width - 1, y);
    }

    if (samples.length === 0) {
      samples.push([255, 255, 255]);
    }
    return samples;
  }

  function minBorderDistance(r, g, b, samples) {
    let minD = Infinity;
    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      const d = colorDistance(r, g, b, s[0], s[1], s[2]);
      if (d < minD) minD = d;
    }
    return minD;
  }

  function featherEdges(mask, width, height, radius) {
    if (radius <= 0) {
      const out = new Uint8Array(mask.length);
      for (let i = 0; i < mask.length; i++) out[i] = mask[i] ? 255 : 0;
      return out;
    }

    const alpha = new Float32Array(mask.length);
    for (let i = 0; i < mask.length; i++) alpha[i] = mask[i] ? 255 : 0;

    let buf = new Float32Array(alpha.length);
    for (let pass = 0; pass < radius; pass++) {
      for (let y = 0; y < height; y++) {
        const row = y * width;
        for (let x = 0; x < width; x++) {
          const idx = row + x;
          // Only soften near matte boundary
          const current = alpha[idx];
          const l = x > 0 ? alpha[idx - 1] : current;
          const r = x < width - 1 ? alpha[idx + 1] : current;
          const u = y > 0 ? alpha[idx - width] : current;
          const d = y < height - 1 ? alpha[idx + width] : current;
          if (l === current && r === current && u === current && d === current) {
            buf[idx] = current;
          } else {
            buf[idx] = (current * 2 + l + r + u + d) / 6;
          }
        }
      }
      alpha.set(buf);
    }

    const out = new Uint8Array(alpha.length);
    for (let i = 0; i < alpha.length; i++) {
      out[i] = mask[i] ? Math.round(Math.min(255, alpha[i])) : 0;
    }
    return out;
  }

  function autoRemove(origImageData, currentImageData, options) {
    const start = performance.now();
    const { width, height, data } = origImageData;
    const total = width * height;
    const tolerance = options.tolerance ?? 38;
    const feather = options.feather ?? 2;
    const method = options.method || "flood";
    const clearHoles = Boolean(options.clearHoles);

    const borderSamples = sampleBorderPalette(data, width, height);
    const keepMask = new Uint8Array(total);
    keepMask.fill(1);

    if (method === "global") {
      for (let i = 0; i < total; i++) {
        const p = i * 4;
        if (data[p + 3] < 20 || minBorderDistance(data[p], data[p + 1], data[p + 2], borderSamples) <= tolerance) {
          keepMask[i] = 0;
        }
      }
    } else {
      // BFS flood-fill starting from all 4 image edges
      const visited = new Uint8Array(total);
      const queue = new Int32Array(total);
      let head = 0;
      let tail = 0;

      const trySeed = (x, y) => {
        const idx = y * width + x;
        if (visited[idx]) return;
        const p = idx * 4;
        if (data[p + 3] < 20 || minBorderDistance(data[p], data[p + 1], data[p + 2], borderSamples) <= tolerance) {
          visited[idx] = 1;
          keepMask[idx] = 0;
          queue[tail++] = idx;
        }
      };

      for (let x = 0; x < width; x++) {
        trySeed(x, 0);
        trySeed(x, height - 1);
      }
      for (let y = 1; y < height - 1; y++) {
        trySeed(0, y);
        trySeed(width - 1, y);
      }

      const maxEdgeJump = Math.max(12, tolerance * 0.45);
      while (head < tail) {
        const idx = queue[head++];
        const x = idx % width;
        const y = (idx - x) / width;
        const p = idx * 4;
        const cr = data[p];
        const cg = data[p + 1];
        const cb = data[p + 2];

        const neighbors = [];
        if (x > 0) neighbors.push(idx - 1);
        if (x < width - 1) neighbors.push(idx + 1);
        if (y > 0) neighbors.push(idx - width);
        if (y < height - 1) neighbors.push(idx + width);

        for (let k = 0; k < neighbors.length; k++) {
          const nIdx = neighbors[k];
          if (visited[nIdx]) continue;
          visited[nIdx] = 1;
          const np = nIdx * 4;
          if (data[np + 3] < 20) {
            keepMask[nIdx] = 0;
            queue[tail++] = nIdx;
            continue;
          }
          const nr = data[np];
          const ng = data[np + 1];
          const nb = data[np + 2];
          const distBorder = minBorderDistance(nr, ng, nb, borderSamples);
          const distLocal = colorDistance(cr, cg, cb, nr, ng, nb);
          if (distBorder <= tolerance && distLocal <= maxEdgeJump) {
            keepMask[nIdx] = 0;
            queue[tail++] = nIdx;
          }
        }
      }

      if (clearHoles) {
        const holeTol = tolerance * 0.65;
        for (let i = 0; i < total; i++) {
          if (!keepMask[i]) continue;
          const p = i * 4;
          if (minBorderDistance(data[p], data[p + 1], data[p + 2], borderSamples) <= holeTol) {
            keepMask[i] = 0;
          }
        }
      }
    }

    const featheredAlpha = featherEdges(keepMask, width, height, feather);
    const out = new ImageData(new Uint8ClampedArray(origImageData.data), width, height);
    let cleared = 0;
    for (let i = 0; i < total; i++) {
      const p = i * 4;
      const a = Math.min(origImageData.data[p + 3], featheredAlpha[i]);
      out.data[p + 3] = a;
      if (a < 20) cleared++;
    }

    return {
      imageData: out,
      elapsedMs: Math.max(1, Math.round(performance.now() - start)),
      transparentPct: Math.round((cleared / total) * 100)
    };
  }

  function magicWandRemove(origImageData, currentImageData, startX, startY, tolerance, feather) {
    const start = performance.now();
    const { width, height, data } = origImageData;
    if (startX < 0 || startY < 0 || startX >= width || startY >= height) return null;

    const total = width * height;
    const seedIdx = startY * width + startX;
    const sp = seedIdx * 4;
    const sr = data[sp];
    const sg = data[sp + 1];
    const sb = data[sp + 2];

    const visited = new Uint8Array(total);
    const hitMask = new Uint8Array(total);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;

    visited[seedIdx] = 1;
    hitMask[seedIdx] = 1;
    queue[tail++] = seedIdx;

    while (head < tail) {
      const idx = queue[head++];
      const x = idx % width;
      const y = (idx - x) / width;

      const neighbors = [];
      if (x > 0) neighbors.push(idx - 1);
      if (x < width - 1) neighbors.push(idx + 1);
      if (y > 0) neighbors.push(idx - width);
      if (y < height - 1) neighbors.push(idx + width);

      for (let k = 0; k < neighbors.length; k++) {
        const nIdx = neighbors[k];
        if (visited[nIdx]) continue;
        visited[nIdx] = 1;
        const np = nIdx * 4;
        if (colorDistance(sr, sg, sb, data[np], data[np + 1], data[np + 2]) <= tolerance) {
          hitMask[nIdx] = 1;
          queue[tail++] = nIdx;
        }
      }
    }

    const out = new ImageData(new Uint8ClampedArray(currentImageData.data), width, height);
    for (let i = 0; i < total; i++) {
      if (hitMask[i]) {
        out.data[i * 4 + 3] = 0;
      }
    }

    if (feather > 0) {
      const keepMask = new Uint8Array(total);
      for (let i = 0; i < total; i++) keepMask[i] = out.data[i * 4 + 3] > 20 ? 1 : 0;
      const alpha = featherEdges(keepMask, width, height, Math.min(2, feather));
      for (let i = 0; i < total; i++) {
        if (hitMask[i]) out.data[i * 4 + 3] = 0;
        else if (out.data[i * 4 + 3] > 0) out.data[i * 4 + 3] = Math.min(origImageData.data[i * 4 + 3], alpha[i]);
      }
    }

    return {
      imageData: out,
      elapsedMs: Math.max(1, Math.round(performance.now() - start)),
      transparentPct: computeTransparentPct(out)
    };
  }

  function globalKeyAtPoint(origImageData, currentImageData, startX, startY, tolerance) {
    const start = performance.now();
    const { width, height, data } = origImageData;
    const sp = (startY * width + startX) * 4;
    const sr = data[sp];
    const sg = data[sp + 1];
    const sb = data[sp + 2];

    const out = new ImageData(new Uint8ClampedArray(currentImageData.data), width, height);
    const total = width * height;
    for (let i = 0; i < total; i++) {
      const p = i * 4;
      if (colorDistance(sr, sg, sb, data[p], data[p + 1], data[p + 2]) <= tolerance) {
        out.data[p + 3] = 0;
      }
    }

    return {
      imageData: out,
      elapsedMs: Math.max(1, Math.round(performance.now() - start)),
      transparentPct: computeTransparentPct(out)
    };
  }

  function applyBrushStroke(origImageData, currentImageData, cx, cy, radius, mode) {
    const { width, height } = currentImageData;
    const rSq = radius * radius;
    const minX = Math.max(0, Math.floor(cx - radius));
    const maxX = Math.min(width - 1, Math.ceil(cx + radius));
    const minY = Math.max(0, Math.floor(cy - radius));
    const maxY = Math.min(height - 1, Math.ceil(cy + radius));

    for (let y = minY; y <= maxY; y++) {
      const dy = y - cy;
      for (let x = minX; x <= maxX; x++) {
        const dx = x - cx;
        const dSq = dx * dx + dy * dy;
        if (dSq > rSq) continue;
        const falloff = 1 - Math.sqrt(dSq) / radius;
        const idx = (y * width + x) * 4;
        if (mode === "erase") {
          const factor = falloff > 0.35 ? 0 : Math.round((1 - falloff / 0.35) * currentImageData.data[idx + 3]);
          currentImageData.data[idx + 3] = Math.min(currentImageData.data[idx + 3], factor);
        } else if (mode === "restore") {
          const origA = origImageData.data[idx + 3];
          const blend = Math.min(1, falloff * 2.2);
          currentImageData.data[idx] = origImageData.data[idx];
          currentImageData.data[idx + 1] = origImageData.data[idx + 1];
          currentImageData.data[idx + 2] = origImageData.data[idx + 2];
          currentImageData.data[idx + 3] = Math.max(currentImageData.data[idx + 3], Math.round(origA * blend));
        }
      }
    }
  }

  function computeTransparentPct(imageData) {
    const data = imageData.data;
    const total = imageData.width * imageData.height;
    let cleared = 0;
    for (let i = 0; i < total; i++) {
      if (data[i * 4 + 3] < 20) cleared++;
    }
    return Math.round((cleared / total) * 100);
  }

  global.CutoutEngine = {
    autoRemove,
    magicWandRemove,
    globalKeyAtPoint,
    applyBrushStroke,
    computeTransparentPct
  };
})(window);
