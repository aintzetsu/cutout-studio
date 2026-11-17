(function () {
  "use strict";

  const stageCanvas = document.getElementById("stageCanvas");
  const stageCtx = stageCanvas.getContext("2d");
  const canvasFrame = document.getElementById("canvasFrame");
  const sampleGrid = document.getElementById("sampleGrid");
  const fileInput = document.getElementById("fileInput");
  const dropzone = document.getElementById("dropzone");

  const undoBtn = document.getElementById("undoBtn");
  const resetBtn = document.getElementById("resetBtn");
  const compareBtn = document.getElementById("compareBtn");
  const autoRemoveBtn = document.getElementById("autoRemoveBtn");
  const holdOrigBtn = document.getElementById("holdOrigBtn");

  const splitHandle = document.getElementById("splitHandle");
  const splitBadgeLeft = document.getElementById("splitBadgeLeft");
  const splitBadgeRight = document.getElementById("splitBadgeRight");

  const toleranceSlider = document.getElementById("toleranceSlider");
  const toleranceVal = document.getElementById("toleranceVal");
  const featherSlider = document.getElementById("featherSlider");
  const featherVal = document.getElementById("featherVal");
  const brushSlider = document.getElementById("brushSlider");
  const brushVal = document.getElementById("brushVal");
  const interiorHolesChk = document.getElementById("interiorHolesChk");
  const dropShadowChk = document.getElementById("dropShadowChk");
  const customBgInput = document.getElementById("customBgInput");

  const statusPill = document.getElementById("statusPill");
  const metaDims = document.getElementById("metaDims");
  const metaTransparent = document.getElementById("metaTransparent");
  const metaTime = document.getElementById("metaTime");
  const metaCursor = document.getElementById("metaCursor");
  const toolPrompt = document.getElementById("toolPrompt");
  const brushCursor = document.getElementById("brushCursor");
  const toastEl = document.getElementById("toast");

  const downloadTransparentBtn = document.getElementById("downloadTransparentBtn");
  const downloadCompositeBtn = document.getElementById("downloadCompositeBtn");

  const state = {
    sourceName: "aero-sneaker",
    width: 720,
    height: 520,
    origImageData: null,
    currImageData: null,
    history: [],
    tool: "wand",
    method: "flood",
    tolerance: 38,
    feather: 2,
    brushSize: 26,
    backdrop: "transparent",
    dropShadow: false,
    compareSplit: false,
    splitPos: 0.45,
    holdOriginal: false,
    isPainting: false,
    isDraggingSplit: false,
    strokeStarted: false,
    lastElapsed: 0
  };

  const offscreenOrig = document.createElement("canvas");
  const offscreenCurr = document.createElement("canvas");
  const origCtx = offscreenOrig.getContext("2d");
  const currCtx = offscreenCurr.getContext("2d");

  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, 2600);
  }

  function pushHistory() {
    if (!state.currImageData) return;
    const snapshot = new ImageData(
      new Uint8ClampedArray(state.currImageData.data),
      state.width,
      state.height
    );
    state.history.push(snapshot);
    if (state.history.length > 20) state.history.shift();
    undoBtn.disabled = state.history.length === 0;
  }

  function popHistory() {
    if (state.history.length === 0) return;
    state.currImageData = state.history.pop();
    currCtx.putImageData(state.currImageData, 0, 0);
    undoBtn.disabled = state.history.length === 0;
    updateTelemetry();
    renderStage();
    showToast("Reverted last edit");
  }

  function loadFromCanvas(sourceCanvas, label) {
    const maxEdge = 920;
    let w = sourceCanvas.width;
    let h = sourceCanvas.height;
    if (w > maxEdge || h > maxEdge) {
      const ratio = Math.min(maxEdge / w, maxEdge / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }

    state.sourceName = label;
    state.width = w;
    state.height = h;
    state.history = [];
    undoBtn.disabled = true;

    stageCanvas.width = w;
    stageCanvas.height = h;
    offscreenOrig.width = w;
    offscreenOrig.height = h;
    offscreenCurr.width = w;
    offscreenCurr.height = h;

    origCtx.clearRect(0, 0, w, h);
    origCtx.drawImage(sourceCanvas, 0, 0, w, h);

    state.origImageData = origCtx.getImageData(0, 0, w, h);
    state.currImageData = new ImageData(
      new Uint8ClampedArray(state.origImageData.data),
      w,
      h
    );
    currCtx.putImageData(state.currImageData, 0, 0);

    runAutoRemove(false);
  }

  function drawBackdrop(ctx, w, h, bgSpec) {
    if (bgSpec === "transparent") return;
    if (bgSpec === "gradient-sunset") {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#f97316");
      g.addColorStop(1, "#ec4899");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      return;
    }
    if (bgSpec === "gradient-mint") {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#0d9488");
      g.addColorStop(1, "#38bdf8");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      return;
    }
    if (bgSpec === "gradient-Sand") {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#f5e6d3");
      g.addColorStop(1, "#d6bfa3");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      return;
    }
    ctx.fillStyle = bgSpec;
    ctx.fillRect(0, 0, w, h);
  }

  function renderStage() {
    if (!state.currImageData || !state.origImageData) return;
    const w = state.width;
    const h = state.height;

    origCtx.putImageData(state.origImageData, 0, 0);
    currCtx.putImageData(state.currImageData, 0, 0);

    stageCtx.clearRect(0, 0, w, h);

    if (state.holdOriginal) {
      stageCtx.drawImage(offscreenOrig, 0, 0);
      return;
    }

    drawBackdrop(stageCtx, w, h, state.backdrop);

    stageCtx.save();
    if (state.dropShadow) {
      stageCtx.shadowColor = "rgba(2, 6, 23, 0.42)";
      stageCtx.shadowBlur = 26;
      stageCtx.shadowOffsetX = 0;
      stageCtx.shadowOffsetY = 14;
    }
    stageCtx.drawImage(offscreenCurr, 0, 0);
    stageCtx.restore();

    if (state.compareSplit) {
      const splitX = Math.round(w * state.splitPos);
      stageCtx.save();
      stageCtx.beginPath();
      stageCtx.rect(0, 0, splitX, h);
      stageCtx.clip();
      stageCtx.drawImage(offscreenOrig, 0, 0);
      stageCtx.restore();

      splitHandle.style.left = `${state.splitPos * 100}%`;
    }
  }

  function updateTelemetry(pctOverride, elapsedOverride) {
    const pct = pctOverride !== undefined
      ? pctOverride
      : window.CutoutEngine.computeTransparentPct(state.currImageData);
    metaDims.textContent = `${state.width} x ${state.height}`;
    metaTransparent.textContent = `${pct}%`;
    metaTime.textContent = `${elapsedOverride !== undefined ? elapsedOverride : state.lastElapsed} ms`;
    statusPill.textContent = `Matte Ready · ${pct}% cleared`;
  }

  function runAutoRemove(saveUndo) {
    if (!state.origImageData) return;
    if (saveUndo) pushHistory();
    const res = window.CutoutEngine.autoRemove(state.origImageData, state.currImageData, {
      tolerance: state.tolerance,
      feather: state.feather,
      method: state.method,
      clearHoles: interiorHolesChk.checked
    });
    state.currImageData = res.imageData;
    state.lastElapsed = res.elapsedMs;
    updateTelemetry(res.transparentPct, res.elapsedMs);
    renderStage();
  }

  function initSamples() {
    sampleGrid.innerHTML = "";
    window.CutoutSamples.list.forEach((sample, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sample-card" + (idx === 0 ? " is-active" : "");
      btn.dataset.sampleId = sample.id;

      const img = document.createElement("img");
      img.src = sample.thumbUrl;
      img.alt = sample.name;
      img.className = "sample-thumb";

      const span = document.createElement("span");
      span.className = "sample-name";
      span.textContent = sample.name;

      btn.appendChild(img);
      btn.appendChild(span);
      btn.addEventListener("click", () => {
        document.querySelectorAll(".sample-card").forEach((c) => c.classList.remove("is-active"));
        btn.classList.add("is-active");
        loadFromCanvas(sample.canvas, sample.id);
        showToast(`Loaded ${sample.name}`);
      });

      sampleGrid.appendChild(btn);
    });

    const first = window.CutoutSamples.list[0];
    loadFromCanvas(first.canvas, first.id);
  }

  function handleUploadedFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Please choose a valid PNG, JPG, or WebP image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const tmp = document.createElement("canvas");
        tmp.width = img.width;
        tmp.height = img.height;
        tmp.getContext("2d").drawImage(img, 0, 0);
        document.querySelectorAll(".sample-card").forEach((c) => c.classList.remove("is-active"));
        const baseName = file.name.replace(/\.[^.]+$/, "") || "uploaded-image";
        loadFromCanvas(tmp, baseName);
        showToast(`Processed ${file.name}`);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function getCanvasCoords(clientX, clientY) {
    const rect = stageCanvas.getBoundingClientRect();
    const scaleX = state.width / rect.width;
    const scaleY = state.height / rect.height;
    return {
      x: Math.max(0, Math.min(state.width - 1, Math.round((clientX - rect.left) * scaleX))),
      y: Math.max(0, Math.min(state.height - 1, Math.round((clientY - rect.top) * scaleY))),
      rect
    };
  }

  function updateBrushIndicator(e) {
    const showBrush = (state.tool === "erase" || state.tool === "restore") && !state.holdOriginal;
    if (!showBrush) {
      brushCursor.hidden = true;
      return;
    }
    const rect = stageCanvas.getBoundingClientRect();
    const pxDiameter = (state.brushSize * 2) * (rect.width / state.width);
    brushCursor.hidden = false;
    brushCursor.style.width = `${Math.max(8, pxDiameter)}px`;
    brushCursor.style.height = `${Math.max(8, pxDiameter)}px`;
    brushCursor.style.left = `${e.clientX}px`;
    brushCursor.style.top = `${e.clientY}px`;
  }

  function exportPng(includeBackdrop) {
    const out = document.createElement("canvas");
    out.width = state.width;
    out.height = state.height;
    const octx = out.getContext("2d");

    if (includeBackdrop && state.backdrop !== "transparent") {
      drawBackdrop(octx, state.width, state.height, state.backdrop);
    }
    currCtx.putImageData(state.currImageData, 0, 0);
    octx.save();
    if (state.dropShadow) {
      octx.shadowColor = "rgba(2, 6, 23, 0.42)";
      octx.shadowBlur = 26;
      octx.shadowOffsetX = 0;
      octx.shadowOffsetY = 14;
    }
    octx.drawImage(offscreenCurr, 0, 0);
    octx.restore();

    const suffix = includeBackdrop ? "studio" : "transparent";
    const link = document.createElement("a");
    link.download = `${state.sourceName}-${suffix}.png`;
    link.href = out.toDataURL("image/png");
    link.click();
    showToast(`Exported ${link.download}`);
  }

  // Event wiring
  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadedFile(e.target.files[0]);
      fileInput.value = "";
    }
  });

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("is-dragover");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("is-dragover"));
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("is-dragover");
    if (e.dataTransfer && e.dataTransfer.files[0]) {
      handleUploadedFile(e.dataTransfer.files[0]);
    }
  });

  document.querySelectorAll(".tool-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tool-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.tool = btn.dataset.tool;
      const prompts = {
        wand: "Click anywhere on background to flood-remove matching contiguous pixels.",
        erase: "Paint directly over artifacts or edges to erase pixels cleanly.",
        restore: "Paint over erased areas to restore pixels from the original image.",
        eyedropper: "Click any hue to key out matching colors across the full canvas."
      };
      toolPrompt.textContent = prompts[state.tool] || "";
    });
  });

  document.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.method = btn.dataset.method;
      runAutoRemove(true);
    });
  });

  toleranceSlider.addEventListener("input", () => {
    state.tolerance = Number(toleranceSlider.value);
    toleranceVal.textContent = String(state.tolerance);
  });
  toleranceSlider.addEventListener("change", () => runAutoRemove(true));

  featherSlider.addEventListener("input", () => {
    state.feather = Number(featherSlider.value);
    featherVal.textContent = `${state.feather} px`;
  });
  featherSlider.addEventListener("change", () => runAutoRemove(true));

  brushSlider.addEventListener("input", () => {
    state.brushSize = Number(brushSlider.value);
    brushVal.textContent = `${state.brushSize} px`;
  });

  interiorHolesChk.addEventListener("change", () => runAutoRemove(true));

  dropShadowChk.addEventListener("change", () => {
    state.dropShadow = dropShadowChk.checked;
    renderStage();
  });

  document.querySelectorAll(".swatch-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".swatch-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.backdrop = btn.dataset.bg;
      renderStage();
    });
  });

  customBgInput.addEventListener("input", () => {
    document.querySelectorAll(".swatch-btn").forEach((b) => b.classList.remove("is-active"));
    state.backdrop = customBgInput.value;
    renderStage();
  });

  autoRemoveBtn.addEventListener("click", () => {
    runAutoRemove(true);
    showToast("Background removed automatically");
  });

  undoBtn.addEventListener("click", popHistory);

  resetBtn.addEventListener("click", () => {
    pushHistory();
    state.currImageData = new ImageData(
      new Uint8ClampedArray(state.origImageData.data),
      state.width,
      state.height
    );
    updateTelemetry(0, 0);
    renderStage();
    showToast("Restored original pixels");
  });

  compareBtn.addEventListener("click", () => {
    state.compareSplit = !state.compareSplit;
    compareBtn.classList.toggle("is-active", state.compareSplit);
    compareBtn.setAttribute("aria-pressed", String(state.compareSplit));
    splitHandle.hidden = !state.compareSplit;
    splitBadgeLeft.hidden = !state.compareSplit;
    splitBadgeRight.hidden = !state.compareSplit;
    renderStage();
  });

  holdOrigBtn.addEventListener("pointerdown", () => {
    state.holdOriginal = true;
    renderStage();
  });
  window.addEventListener("pointerup", () => {
    if (state.holdOriginal) {
      state.holdOriginal = false;
      renderStage();
    }
    state.isPainting = false;
    state.isDraggingSplit = false;
  });

  splitHandle.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    state.isDraggingSplit = true;
  });

  splitHandle.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      state.splitPos = Math.max(0.05, state.splitPos - 0.04);
      renderStage();
    } else if (e.key === "ArrowRight") {
      state.splitPos = Math.min(0.95, state.splitPos + 0.04);
      renderStage();
    }
  });

  window.addEventListener("pointermove", (e) => {
    if (state.isDraggingSplit) {
      const rect = canvasFrame.getBoundingClientRect();
      state.splitPos = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
      renderStage();
    }
  });

  stageCanvas.addEventListener("pointerdown", (e) => {
    const pos = getCanvasCoords(e.clientX, e.clientY);
    if (state.tool === "wand") {
      pushHistory();
      const res = window.CutoutEngine.magicWandRemove(
        state.origImageData,
        state.currImageData,
        pos.x,
        pos.y,
        state.tolerance,
        state.feather
      );
      if (res) {
        state.currImageData = res.imageData;
        state.lastElapsed = res.elapsedMs;
        updateTelemetry(res.transparentPct, res.elapsedMs);
        renderStage();
      }
      return;
    }

    if (state.tool === "eyedropper") {
      pushHistory();
      const res = window.CutoutEngine.globalKeyAtPoint(
        state.origImageData,
        state.currImageData,
        pos.x,
        pos.y,
        state.tolerance
      );
      state.currImageData = res.imageData;
      state.lastElapsed = res.elapsedMs;
      updateTelemetry(res.transparentPct, res.elapsedMs);
      renderStage();
      return;
    }

    if (state.tool === "erase" || state.tool === "restore") {
      pushHistory();
      state.isPainting = true;
      window.CutoutEngine.applyBrushStroke(
        state.origImageData,
        state.currImageData,
        pos.x,
        pos.y,
        state.brushSize,
        state.tool
      );
      updateTelemetry();
      renderStage();
    }
  });

  stageCanvas.addEventListener("pointermove", (e) => {
    const pos = getCanvasCoords(e.clientX, e.clientY);
    metaCursor.textContent = `${pos.x}, ${pos.y}`;
    updateBrushIndicator(e);

    if (state.isPainting && (state.tool === "erase" || state.tool === "restore")) {
      window.CutoutEngine.applyBrushStroke(
        state.origImageData,
        state.currImageData,
        pos.x,
        pos.y,
        state.brushSize,
        state.tool
      );
      updateTelemetry();
      renderStage();
    }
  });

  stageCanvas.addEventListener("pointerleave", () => {
    brushCursor.hidden = true;
    metaCursor.textContent = "--, --";
  });

  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      popHistory();
    }
  });

  downloadTransparentBtn.addEventListener("click", () => exportPng(false));
  downloadCompositeBtn.addEventListener("click", () => exportPng(true));

  initSamples();
})();
