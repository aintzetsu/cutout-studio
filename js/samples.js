(function (global) {
  "use strict";

  const WIDTH = 720;
  const HEIGHT = 520;

  function makeCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    return canvas;
  }

  function drawRadialStudio(ctx, c1, c2) {
    const grad = ctx.createRadialGradient(WIDTH * 0.5, HEIGHT * 0.42, 40, WIDTH * 0.5, HEIGHT * 0.5, WIDTH * 0.65);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  function renderSneaker() {
    const canvas = makeCanvas();
    const ctx = canvas.getContext("2d");
    drawRadialStudio(ctx, "#e5eef7", "#c4d6e8");

    ctx.save();
    ctx.translate(WIDTH / 2, HEIGHT / 2 + 24);
    ctx.rotate(-0.08);

    // Midsole base
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-210, 48);
    ctx.quadraticCurveTo(-40, 62, 200, 46);
    ctx.quadraticCurveTo(222, 42, 218, 22);
    ctx.quadraticCurveTo(100, 12, -198, 12);
    ctx.quadraticCurveTo(-222, 28, -210, 48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rubber outsole tread
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.moveTo(-208, 48);
    ctx.quadraticCurveTo(-40, 64, 198, 46);
    ctx.lineTo(194, 58);
    ctx.quadraticCurveTo(-40, 74, -204, 60);
    ctx.closePath();
    ctx.fill();

    // Upper Crimson Leather
    const upperGrad = ctx.createLinearGradient(-190, -110, 190, 20);
    upperGrad.addColorStop(0, "#e11d48");
    upperGrad.addColorStop(0.55, "#be123c");
    upperGrad.addColorStop(1, "#881337");
    ctx.fillStyle = upperGrad;
    ctx.beginPath();
    ctx.moveTo(-194, 14);
    ctx.lineTo(-170, -82);
    ctx.quadraticCurveTo(-135, -104, -104, -84);
    ctx.quadraticCurveTo(-55, -52, -10, -96);
    ctx.lineTo(36, -68);
    ctx.quadraticCurveTo(118, -32, 195, -6);
    ctx.quadraticCurveTo(216, 4, 214, 22);
    ctx.lineTo(-194, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Slate Heel Overlay
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.moveTo(-194, 14);
    ctx.lineTo(-170, -82);
    ctx.lineTo(-108, -30);
    ctx.lineTo(-116, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cream Side Wing / Accent Stripe
    ctx.fillStyle = "#fef3c7";
    ctx.beginPath();
    ctx.moveTo(-78, -6);
    ctx.quadraticCurveTo(20, -28, 128, -2);
    ctx.quadraticCurveTo(50, 8, -72, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Collar & Tongue
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.ellipse(-98, -78, 40, 18, -0.25, 0, Math.PI * 2);
    ctx.fill();

    // Crisscross Laces
    ctx.strokeStyle = "#f8fafc";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    for (let i = 0; i < 4; i++) {
      const lx = -22 + i * 24;
      const ly = -76 + i * 11;
      ctx.beginPath();
      ctx.moveTo(lx - 10, ly - 8);
      ctx.lineTo(lx + 14, ly + 8);
      ctx.stroke();
    }

    // Midsole air cushion window
    ctx.fillStyle = "#14b8a6";
    ctx.fillRect(-156, 23, 54, 14);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    ctx.strokeRect(-156, 23, 54, 14);

    ctx.restore();
    return canvas;
  }

  function renderEspresso() {
    const canvas = makeCanvas();
    const ctx = canvas.getContext("2d");
    drawRadialStudio(ctx, "#f4e7d4", "#dfd0b8");

    ctx.save();
    ctx.translate(WIDTH / 2, HEIGHT / 2 + 12);

    // Saucer
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 108, 184, 42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.ellipse(0, 104, 118, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cup Handle (with hollow center showing backdrop)
    ctx.strokeStyle = "#1d4ed8";
    ctx.lineWidth = 24;
    ctx.beginPath();
    ctx.arc(118, -6, 54, -Math.PI * 0.45, Math.PI * 0.48);
    ctx.stroke();

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(118, -6, 66, -Math.PI * 0.46, Math.PI * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(118, -6, 42, -Math.PI * 0.42, Math.PI * 0.45);
    ctx.stroke();

    // Cup Body
    const cupGrad = ctx.createLinearGradient(-120, -90, 120, 90);
    cupGrad.addColorStop(0, "#2563eb");
    cupGrad.addColorStop(0.5, "#1d4ed8");
    cupGrad.addColorStop(1, "#1e3a8a");
    ctx.fillStyle = cupGrad;
    ctx.beginPath();
    ctx.moveTo(-124, -84);
    ctx.lineTo(124, -84);
    ctx.quadraticCurveTo(118, 86, 68, 104);
    ctx.lineTo(-68, 104);
    ctx.quadraticCurveTo(-118, 86, -124, -84);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cup Rim
    ctx.fillStyle = "#eff6ff";
    ctx.beginPath();
    ctx.ellipse(0, -84, 124, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Coffee & Crema
    ctx.fillStyle = "#451a03";
    ctx.beginPath();
    ctx.ellipse(0, -82, 108, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#d97706";
    ctx.beginPath();
    ctx.ellipse(-6, -82, 76, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Latte Rosetta Heart
    ctx.fillStyle = "#fef3c7";
    ctx.beginPath();
    ctx.moveTo(0, -73);
    ctx.bezierCurveTo(-24, -92, -38, -76, 0, -68);
    ctx.bezierCurveTo(38, -76, 24, -92, 0, -73);
    ctx.fill();

    ctx.restore();
    return canvas;
  }

  function renderMonstera() {
    const canvas = makeCanvas();
    const ctx = canvas.getContext("2d");
    drawRadialStudio(ctx, "#fce2d8", "#f3beb0");

    ctx.save();
    ctx.translate(WIDTH / 2, HEIGHT / 2 + 10);

    // Stem
    ctx.strokeStyle = "#14532d";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-4, 40);
    ctx.quadraticCurveTo(-8, 130, 12, 200);
    ctx.stroke();

    // Main Leaf Shape
    const leafGrad = ctx.createLinearGradient(-150, -170, 150, 140);
    leafGrad.addColorStop(0, "#10b981");
    leafGrad.addColorStop(0.55, "#059669");
    leafGrad.addColorStop(1, "#065f46");
    ctx.fillStyle = leafGrad;
    ctx.strokeStyle = "#064e3b";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(0, -175);
    ctx.bezierCurveTo(140, -155, 192, -30, 145, 95);
    ctx.bezierCurveTo(118, 158, 35, 148, 0, 102);
    ctx.bezierCurveTo(-35, 148, -118, 158, -145, 95);
    ctx.bezierCurveTo(-192, -30, -140, -155, 0, -175);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Paint Fenestration Holes matching background gradient so enclosed-hole toggle works vividly
    const holes = [
      { x: -64, y: -62, rx: 32, ry: 12, rot: -0.28 },
      { x: -72, y: 12, rx: 36, ry: 13, rot: -0.15 },
      { x: 64, y: -56, rx: 30, ry: 12, rot: 0.28 },
      { x: 74, y: 18, rx: 34, ry: 13, rot: 0.16 }
    ];
    holes.forEach((h) => {
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(h.rot);
      ctx.fillStyle = "#f9d5c8";
      ctx.beginPath();
      ctx.ellipse(0, 0, h.rx, h.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#064e3b";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    });

    // Center Midrib & Side Veins
    ctx.strokeStyle = "#a7f3d0";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -152);
    ctx.lineTo(0, 102);
    ctx.stroke();

    ctx.lineWidth = 2.5;
    [-98, -26, 44].forEach((vy) => {
      ctx.beginPath();
      ctx.moveTo(0, vy);
      ctx.quadraticCurveTo(-48, vy - 18, -112, vy - 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, vy);
      ctx.quadraticCurveTo(48, vy - 18, 112, vy - 2);
      ctx.stroke();
    });

    ctx.restore();
    return canvas;
  }

  function renderPortrait() {
    const canvas = makeCanvas();
    const ctx = canvas.getContext("2d");
    drawRadialStudio(ctx, "#d2efe1", "#9ecdb7");

    ctx.save();
    ctx.translate(WIDTH / 2, HEIGHT / 2 + 30);

    // Jacket / Shoulders
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-162, 198);
    ctx.quadraticCurveTo(-150, 74, -44, 58);
    ctx.lineTo(44, 58);
    ctx.quadraticCurveTo(150, 74, 162, 198);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner T-Shirt Collar
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.moveTo(-48, 60);
    ctx.quadraticCurveTo(0, 112, 48, 60);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Neck
    ctx.fillStyle = "#e0a97e";
    ctx.beginPath();
    ctx.roundRect(-28, 12, 56, 62, 16);
    ctx.fill();
    ctx.stroke();

    // Back Hair
    ctx.fillStyle = "#27272a";
    ctx.beginPath();
    ctx.arc(0, -68, 94, Math.PI * 0.88, Math.PI * 2.12);
    ctx.fill();

    // Face
    ctx.fillStyle = "#f2be96";
    ctx.beginPath();
    ctx.ellipse(0, -56, 70, 86, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Front Bangs
    ctx.fillStyle = "#18181b";
    ctx.beginPath();
    ctx.moveTo(-70, -76);
    ctx.quadraticCurveTo(-20, -148, 66, -86);
    ctx.quadraticCurveTo(18, -110, -18, -94);
    ctx.quadraticCurveTo(-46, -104, -70, -76);
    ctx.closePath();
    ctx.fill();

    // Architectural Glasses
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 4;
    ctx.fillStyle = "rgba(14, 165, 233, 0.15)";
    ctx.beginPath();
    ctx.roundRect(-52, -74, 44, 30, 8);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(8, -74, 44, 30, 8);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-8, -60);
    ctx.lineTo(8, -60);
    ctx.stroke();

    // Smile
    ctx.strokeStyle = "#7c2d12";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, -24, 22, 0.2, Math.PI - 0.2);
    ctx.stroke();

    ctx.restore();
    return canvas;
  }

  const SAMPLES = [
    { id: "sneaker", name: "Aero Sneaker", render: renderSneaker },
    { id: "espresso", name: "Ceramic Cup", render: renderEspresso },
    { id: "monstera", name: "Monstera Leaf", render: renderMonstera },
    { id: "portrait", name: "Studio Portrait", render: renderPortrait }
  ];

  global.CutoutSamples = {
    list: SAMPLES.map((item) => {
      const canvas = item.render();
      return {
        id: item.id,
        name: item.name,
        canvas,
        thumbUrl: canvas.toDataURL("image/png")
      };
    })
  };
})(window);
