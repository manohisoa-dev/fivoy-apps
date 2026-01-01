// WatermarkStudio.jsx
// Standalone React 18 module for adding watermarks to images/posters
// UI: Tailwind CSS + lucide-react
// Exports one default React component <WatermarkStudio /> you can route to under "Watermark Studio".
//
// 📦 Peer deps you should have in your app:
//   npm i jspdf file-saver jszip lucide-react clsx
//
// ✅ Features covered
// - Multi-image upload & preview grid (JPG/PNG/WEBP)
// - Select image to edit on a canvas (Canvas API)
// - Text watermark (font, size, color, opacity, rotation, drag & drop, quick position)
// - Image watermark/logo (PNG w/ transparency, scale, opacity, rotation, drag & drop, quick position)
// - Simple filters: brightness, contrast, saturation, grayscale, blur (live preview via ctx.filter)
// - Undo / Redo, Reset, Apply-to-all
// - Export: PNG per image, or multi-page PDF via jsPDF
// - If exporting multiple PNGs, auto-zip into a single ZIP via JSZip + FileSaver
//
// ⚠️ Notes
// - This file is self-contained. You can split into files later if desired.
// - Uses a simple history stack for undo/redo.
// - For accuracy, export draws at the image's natural resolution, separate from screen scale.
//
// ---------------------------------------------------------------
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Upload, Settings2, Type, Image as ImageIcon, SlidersHorizontal, Download, Undo2, Redo2, RotateCw, Move3D, Grid2X2, ZoomIn, ZoomOut, Target, CopyCheck, FileDown, FileImage } from "lucide-react";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import clsx from "clsx";

// ----------------------- Utilities -----------------------
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const deg2rad = (d) => (d * Math.PI) / 180;

function useDebounced(value, delay = 150) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

// ----------------------- Hooks -----------------------
function useWatermarkEditor() {
  // images: { id, file, url, imgEl (Image), name }
  const [images, setImages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // text wm
  const [textWM, setTextWM] = useState({
    text: "Fivoy Films",
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
    fontSize: 48,
    color: "#FFFFFF",
    opacity: 0.35,
    rotation: 0,
    x: 80, // px (canvas coords)
    y: 80,
  });

  // image/logo wm
  const [logoWM, setLogoWM] = useState({
    url: null,
    imgEl: null,
    scale: 0.3, // % of min(imageW,imageH)
    opacity: 0.35,
    rotation: 0,
    x: 120,
    y: 120,
  });

  // filters
  const [filters, setFilters] = useState({
    brightness: 100, // %
    contrast: 100, // %
    saturation: 100, // %
    grayscale: 0, // %
    blur: 0, // px
  });

  // history for undo/redo
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const snapshot = useCallback(() => ({
    textWM: { ...textWM },
    logoWM: {
      url: logoWM.url,
      scale: logoWM.scale,
      opacity: logoWM.opacity,
      rotation: logoWM.rotation,
      x: logoWM.x,
      y: logoWM.y,
    },
    filters: { ...filters },
    selectedId,
  }), [textWM, logoWM, filters, selectedId]);

  const commit = useCallback((label = "change") => {
    setHistory((h) => [...h, snapshot()]);
    setFuture([]);
  }, [snapshot]);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      setFuture((f) => [snapshot(), ...f]);
      // restore
      setTextWM(prev.textWM);
      setLogoWM(l => ({ ...l, ...prev.logoWM, imgEl: l.imgEl }));
      setFilters(prev.filters);
      setSelectedId(prev.selectedId);
      return h.slice(0, -1);
    });
  }, [snapshot]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f;
      const next = f[0];
      setHistory((h) => [...h, snapshot()]);
      setTextWM(next.textWM);
      setLogoWM(l => ({ ...l, ...next.logoWM, imgEl: l.imgEl }));
      setFilters(next.filters);
      setSelectedId(next.selectedId);
      return f.slice(1);
    });
  }, [snapshot]);

  const reset = useCallback(() => {
    setTextWM(t => ({ ...t, text: "Fivoy Films", fontSize: 48, color: "#FFFFFF", opacity: 0.35, rotation: 0, x: 80, y: 80 }));
    setLogoWM(l => ({ ...l, scale: 0.3, opacity: 0.35, rotation: 0, x: 120, y: 120 }));
    setFilters({ brightness: 100, contrast: 100, saturation: 100, grayscale: 0, blur: 0 });
    setHistory([]);
    setFuture([]);
  }, []);

  // images helpers
  const addFiles = useCallback(async (fileList) => {
    const arr = Array.from(fileList || []);
    const mapped = await Promise.all(arr.map(async (file, idx) => {
      const url = URL.createObjectURL(file);
      const imgEl = await new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = url;
      });
      return { id: `${Date.now()}-${idx}-${Math.random()}`, file, url, imgEl, name: file.name };
    }));
    setImages((prev) => [...prev, ...mapped]);
    if (!selectedId && mapped[0]) setSelectedId(mapped[0].id);
  }, [selectedId]);

  const removeImage = useCallback((id) => {
    setImages(prev => prev.filter(i => i.id !== id));
    if (selectedId === id) setSelectedId((prev) => {
      const remain = images.filter(i => i.id !== id);
      return remain[0]?.id || null;
    });
  }, [images, selectedId]);

  const selected = useMemo(() => images.find(i => i.id === selectedId) || null, [images, selectedId]);

  const setLogoFile = useCallback(async (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const imgEl = await new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = url;
    });
    setLogoWM((l) => ({ ...l, url, imgEl }));
  }, []);

  return {
    images, selected, selectedId, setSelectedId, addFiles, removeImage,
    textWM, setTextWM,
    logoWM, setLogoWM, setLogoFile,
    filters, setFilters,
    commit, undo, redo, reset,
  };
}

function useCanvas({ selected, textWM, logoWM, filters }) {
  const canvasRef = useRef(null);
  const [viewportScale, setViewportScale] = useState(1);

  const draw = useCallback((ctx, w, h) => {
    if (!selected?.imgEl) return;
    // base
    ctx.save();
    ctx.clearRect(0, 0, w, h);
    // filters
    const f = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) grayscale(${filters.grayscale}%) blur(${filters.blur}px)`;
    ctx.filter = f;
    ctx.drawImage(selected.imgEl, 0, 0, w, h);
    ctx.filter = "none"; // watermark should not be filtered

    // text watermark
    if (textWM?.text) {
      ctx.save();
      ctx.globalAlpha = clamp(textWM.opacity, 0, 1);
      ctx.translate(textWM.x, textWM.y);
      ctx.rotate(deg2rad(textWM.rotation || 0));
      ctx.font = `${textWM.fontSize}px ${textWM.fontFamily}`;
      ctx.fillStyle = textWM.color || "#ffffff";
      ctx.textBaseline = "top";
      ctx.fillText(textWM.text, 0, 0);
      ctx.restore();
    }

    // logo watermark
    if (logoWM?.imgEl && logoWM?.url) {
      const minSide = Math.min(w, h);
      const size = Math.max(8, logoWM.scale * minSide);
      const imgW = logoWM.imgEl.width;
      const imgH = logoWM.imgEl.height;
      const aspect = imgW / imgH;
      const drawW = aspect >= 1 ? size : size * aspect;
      const drawH = aspect >= 1 ? size / aspect : size;
      ctx.save();
      ctx.globalAlpha = clamp(logoWM.opacity, 0, 1);
      ctx.translate(logoWM.x, logoWM.y);
      ctx.rotate(deg2rad(logoWM.rotation || 0));
      ctx.drawImage(logoWM.imgEl, 0, 0, drawW, drawH);
      ctx.restore();
    }

    ctx.restore();
  }, [selected, textWM, logoWM, filters]);

  const redraw = useCallback(() => {
    const c = canvasRef.current;
    if (!c || !selected?.imgEl) return;
    const ctx = c.getContext("2d");
    draw(ctx, c.width, c.height);
  }, [draw, selected]);

  const fitToContainer = useCallback(() => {
    const c = canvasRef.current;
    if (!c || !selected?.imgEl) return;
    const parent = c.parentElement;
    const maxW = parent.clientWidth;
    const maxH = parent.clientHeight;
    const imgW = selected.imgEl.width;
    const imgH = selected.imgEl.height;
    const scale = Math.min(maxW / imgW, maxH / imgH, 1);
    c.width = Math.floor(imgW * scale);
    c.height = Math.floor(imgH * scale);
    setViewportScale(scale);
    redraw();
  }, [selected, redraw]);

  useEffect(() => {
    fitToContainer();
    const ro = new ResizeObserver(fitToContainer);
    if (canvasRef.current?.parentElement) ro.observe(canvasRef.current.parentElement);
    return () => ro.disconnect();
  }, [fitToContainer]);

  useEffect(() => { redraw(); }, [redraw, selected, textWM, logoWM, filters]);

  return { canvasRef, viewportScale, fitToContainer, redraw };
}

function useBatchExport({ images, textWM, logoWM, filters }) {
  const renderToCanvas = useCallback((imgEl) => {
    const w = imgEl.width;
    const h = imgEl.height;
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");

    // base with filters
    ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) grayscale(${filters.grayscale}%) blur(${filters.blur}px)`;
    ctx.drawImage(imgEl, 0, 0, w, h);
    ctx.filter = "none";

    // text
    if (textWM?.text) {
      ctx.save();
      ctx.globalAlpha = clamp(textWM.opacity, 0, 1);
      ctx.translate(textWM.x / 1, textWM.y / 1); // already in px coordinates
      ctx.rotate(deg2rad(textWM.rotation || 0));
      ctx.font = `${textWM.fontSize}px ${textWM.fontFamily}`;
      ctx.fillStyle = textWM.color || "#ffffff";
      ctx.textBaseline = "top";
      ctx.fillText(textWM.text, 0, 0);
      ctx.restore();
    }

    // logo
    if (logoWM?.imgEl && logoWM?.url) {
      const minSide = Math.min(w, h);
      const size = Math.max(8, logoWM.scale * minSide);
      const imgW = logoWM.imgEl.width;
      const imgH = logoWM.imgEl.height;
      const aspect = imgW / imgH;
      const drawW = aspect >= 1 ? size : size * aspect;
      const drawH = aspect >= 1 ? size / aspect : size;
      ctx.save();
      ctx.globalAlpha = clamp(logoWM.opacity, 0, 1);
      ctx.translate(logoWM.x, logoWM.y);
      ctx.rotate(deg2rad(logoWM.rotation || 0));
      ctx.drawImage(logoWM.imgEl, 0, 0, drawW, drawH);
      ctx.restore();
    }

    return c;
  }, [textWM, logoWM, filters]);

  const exportPNGorZIP = useCallback(async () => {
    if (!images.length) return;
    if (images.length === 1) {
      const canvas = renderToCanvas(images[0].imgEl);
      canvas.toBlob((blob) => {
        if (blob) saveAs(blob, images[0].name.replace(/\.[^.]+$/, "") + "_watermarked.png");
      });
    } else {
      const zip = new JSZip();
      for (const item of images) {
        const c = renderToCanvas(item.imgEl);
        // use toBlob for better memory
        // wrap in promise
        // eslint-disable-next-line no-await-in-loop
        const blob = await new Promise((res) => c.toBlob(res, "image/png"));
        if (blob) zip.file(item.name.replace(/\.[^.]+$/, "") + "_watermarked.png", blob);
      }
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "watermarked_images.zip");
    }
  }, [images, renderToCanvas]);

  const exportPDF = useCallback(async () => {
    if (!images.length) return;
    // We'll build a PDF with one image per page, auto-fit preserving aspect ratio
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    let first = true;
    for (const item of images) {
      const c = renderToCanvas(item.imgEl);
      const dataURL = c.toDataURL("image/jpeg", 0.92);
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();

      // Compute draw size
      const imgW = c.width; const imgH = c.height;
      const scale = Math.min(pageW / imgW, pageH / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const x = (pageW - drawW) / 2;
      const y = (pageH - drawH) / 2;

      if (!first) doc.addPage();
      first = false;
      doc.addImage(dataURL, "JPEG", x, y, drawW, drawH);
    }
    doc.save("watermarked_images.pdf");
  }, [images, renderToCanvas]);

  return { exportPNGorZIP, exportPDF };
}

// ----------------------- UI Components -----------------------
function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 font-semibold text-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </div>
  );
}

function ToolbarButton({ icon: Icon, label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "px-3 py-2 rounded-xl border border-zinc-300/60 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800",
        "text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

function ImageGrid({ images, selectedId, setSelectedId, removeImage }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-3">
      {images.map(img => (
        <div key={img.id} className={clsx("relative group cursor-pointer rounded-xl overflow-hidden border", selectedId === img.id ? "border-indigo-500 ring-2 ring-indigo-400" : "border-zinc-200 dark:border-zinc-700")}
             onClick={() => setSelectedId(img.id)}>
          <img src={img.url} alt={img.name} className="w-full h-28 object-cover" />
          <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-xs px-2 py-1 truncate">{img.name}</div>
          <button
            onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
            className="absolute top-2 right-2 text-xs bg-white/90 dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-700 px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100"
          >Remove</button>
        </div>
      ))}
    </div>
  );
}

function EditorCanvas({ canvasRef, selected, textWM, logoWM, setTextWM, setLogoWM, viewportScale }) {
  // drag state
  const [drag, setDrag] = useState({ active: false, target: null, startX: 0, startY: 0, origX: 0, origY: 0 });

  const onMouseDown = useCallback((e) => {
    const c = canvasRef.current; if (!c) return;
    const rect = c.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);

    // hit test: prioritize logo, then text (simple bbox)
    const hits = [];

    if (logoWM?.imgEl && logoWM?.url) {
      const minSide = Math.min(c.width, c.height);
      const size = Math.max(8, logoWM.scale * minSide);
      const imgW = logoWM.imgEl.width;
      const imgH = logoWM.imgEl.height;
      const aspect = imgW / imgH;
      const drawW = aspect >= 1 ? size : size * aspect;
      const drawH = aspect >= 1 ? size / aspect : size;
      // naive bbox w/o rotation (good enough for quick grab)
      if (x >= logoWM.x && x <= logoWM.x + drawW && y >= logoWM.y && y <= logoWM.y + drawH) {
        hits.push({ target: "logo", drawW, drawH });
      }
    }

    if (textWM?.text) {
      // approximate text metrics (cannot get exact quickly). Use fontSize * text length * 0.6 for width, 1.2 * fontSize for height
      const drawW = Math.max(40, textWM.fontSize * (textWM.text.length * 0.6));
      const drawH = Math.max(20, textWM.fontSize * 1.2);
      if (x >= textWM.x && x <= textWM.x + drawW && y >= textWM.y && y <= textWM.y + drawH) {
        hits.push({ target: "text", drawW, drawH });
      }
    }

    const top = hits[0];
    if (top) {
      setDrag({ active: true, target: top.target, startX: x, startY: y, origX: top.target === "text" ? textWM.x : logoWM.x, origY: top.target === "text" ? textWM.y : logoWM.y });
    }
  }, [canvasRef, textWM, logoWM]);

  const onMouseMove = useCallback((e) => {
    if (!drag.active) return;
    const c = canvasRef.current; if (!c) return;
    const rect = c.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);
    const dx = (x - drag.startX);
    const dy = (y - drag.startY);

    const newX = clamp(drag.origX + dx, 0, c.width - 5);
    const newY = clamp(drag.origY + dy, 0, c.height - 5);

    if (drag.target === "text") setTextWM(t => ({ ...t, x: newX, y: newY }));
    if (drag.target === "logo") setLogoWM(l => ({ ...l, x: newX, y: newY }));
  }, [drag, canvasRef, setTextWM, setLogoWM]);

  const onMouseUp = useCallback(() => setDrag(d => ({ ...d, active: false, target: null })), []);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    c.addEventListener("mouseleave", onMouseUp);
    return () => c.removeEventListener("mouseleave", onMouseUp);
  }, [canvasRef, onMouseUp]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      {!selected && (
        <div className="absolute inset-0 grid place-items-center text-zinc-500 text-sm">
          <div className="flex items-center gap-2"><Upload className="w-4 h-4"/> Import images to start</div>
        </div>
      )}
      <div className="absolute top-2 right-2 text-xs bg-black/50 text-white px-2 py-1 rounded-md">{Math.round(viewportScale*100)}%</div>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-move"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      />
    </div>
  );
}

function SidebarControls({ tab, setTab, addFiles, textWM, setTextWM, logoWM, setLogoFile, filters, setFilters, quickPos }) {
  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-5 text-xs font-medium rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <button onClick={() => setTab("import")} className={clsx("px-2 py-2 flex items-center justify-center gap-1", tab === "import" ? "bg-zinc-100 dark:bg-zinc-800" : "bg-transparent")}><Upload className="w-4 h-4"/>Importer</button>
        <button onClick={() => setTab("text")} className={clsx("px-2 py-2 flex items-center justify-center gap-1", tab === "text" ? "bg-zinc-100 dark:bg-zinc-800" : "bg-transparent")}><Type className="w-4 h-4"/>Texte</button>
        <button onClick={() => setTab("image")} className={clsx("px-2 py-2 flex items-center justify-center gap-1", tab === "image" ? "bg-zinc-100 dark:bg-zinc-800" : "bg-transparent")}><ImageIcon className="w-4 h-4"/>Image</button>
        <button onClick={() => setTab("filters")} className={clsx("px-2 py-2 flex items-center justify-center gap-1", tab === "filters" ? "bg-zinc-100 dark:bg-zinc-800" : "bg-transparent")}><SlidersHorizontal className="w-4 h-4"/>Filtres</button>
        <button onClick={() => setTab("export")} className={clsx("px-2 py-2 flex items-center justify-center gap-1", tab === "export" ? "bg-zinc-100 dark:bg-zinc-800" : "bg-transparent")}><Download className="w-4 h-4"/>Export</button>
      </div>

      <div className="mt-3 flex-1 overflow-auto pr-1">
        {tab === "import" && (
          <div className="space-y-4">
            <SectionTitle icon={Upload}>Importer des images</SectionTitle>
            <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(e) => addFiles(e.target.files)} className="block w-full text-sm" />
            <p className="text-xs text-zinc-500">Formats acceptés : JPG, PNG, WEBP</p>
          </div>
        )}

        {tab === "text" && (
          <div className="space-y-4">
            <SectionTitle icon={Type}>Texte filigrane</SectionTitle>
            <div className="space-y-2">
              <label className="block text-xs">Texte</label>
              <input value={textWM.text} onChange={(e) => setTextWM(t => ({ ...t, text: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"/>
              <label className="block text-xs">Police (CSS font-family)</label>
              <input value={textWM.fontFamily} onChange={(e) => setTextWM(t => ({ ...t, fontFamily: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border"/>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs">Taille</label>
                  <input type="range" min={10} max={200} value={textWM.fontSize} onChange={(e) => setTextWM(t => ({ ...t, fontSize: +e.target.value }))} className="w-full"/>
                  <div className="text-xs text-right">{textWM.fontSize}px</div>
                </div>
                <div>
                  <label className="block text-xs">Opacité</label>
                  <input type="range" min={0} max={1} step={0.01} value={textWM.opacity} onChange={(e) => setTextWM(t => ({ ...t, opacity: +e.target.value }))} className="w-full"/>
                  <div className="text-xs text-right">{Math.round(textWM.opacity*100)}%</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs">Rotation</label>
                  <input type="range" min={-180} max={180} value={textWM.rotation} onChange={(e) => setTextWM(t => ({ ...t, rotation: +e.target.value }))} className="w-full"/>
                </div>
                <div>
                  <label className="block text-xs">Couleur</label>
                  <input type="color" value={textWM.color} onChange={(e) => setTextWM(t => ({ ...t, color: e.target.value }))} className="w-full h-9 p-1 rounded-md"/>
                </div>
              </div>

              <div className="mt-3">
                <SectionTitle icon={Target}>Position rapide</SectionTitle>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                  {["TL","TC","TR","CL","CC","CR","BL","BC","BR"].map(key => (
                    <button key={key} onClick={() => quickPos(key, "text")}
                            className="px-2 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "image" && (
          <div className="space-y-4">
            <SectionTitle icon={ImageIcon}>Image / logo</SectionTitle>
            <input type="file" accept="image/png" onChange={(e) => setLogoFile(e.target.files?.[0])} className="block w-full text-sm" />
            {!logoWM.url && <p className="text-xs text-zinc-500">PNG transparent recommandé</p>}
            {logoWM.url && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs">Taille (rel.)</label>
                    <input type="range" min={0.05} max={0.9} step={0.01} value={logoWM.scale}
                           onChange={(e) => setLogoWM(l => ({ ...l, scale: +e.target.value }))}
                           className="w-full"/>
                  </div>
                  <div>
                    <label className="block text-xs">Opacité</label>
                    <input type="range" min={0} max={1} step={0.01} value={logoWM.opacity}
                           onChange={(e) => setLogoWM(l => ({ ...l, opacity: +e.target.value }))}
                           className="w-full"/>
                  </div>
                </div>
                <label className="block text-xs">Rotation</label>
                <input type="range" min={-180} max={180} value={logoWM.rotation}
                       onChange={(e) => setLogoWM(l => ({ ...l, rotation: +e.target.value }))}
                       className="w-full"/>

                <div className="mt-3">
                  <SectionTitle icon={Target}>Position rapide</SectionTitle>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                    {["TL","TC","TR","CL","CC","CR","BL","BC","BR"].map(key => (
                      <button key={key} onClick={() => quickPos(key, "logo")}
                              className="px-2 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        {key}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "filters" && (
          <div className="space-y-4">
            <SectionTitle icon={SlidersHorizontal}>Filtres</SectionTitle>
            {[
              { key: "brightness", label: "Luminosité", min: 0, max: 200 },
              { key: "contrast", label: "Contraste", min: 0, max: 200 },
              { key: "saturation", label: "Saturation", min: 0, max: 200 },
              { key: "grayscale", label: "Noir & blanc", min: 0, max: 100 },
              { key: "blur", label: "Flou (px)", min: 0, max: 10 },
            ].map(ctrl => (
              <div key={ctrl.key}>
                <label className="block text-xs">{ctrl.label}</label>
                <input type="range" min={ctrl.min} max={ctrl.max} value={filters[ctrl.key]}
                       onChange={(e) => setFilters(f => ({ ...f, [ctrl.key]: +e.target.value }))}
                       className="w-full"/>
              </div>
            ))}
          </div>
        )}

        {tab === "export" && (
          <div className="space-y-4">
            <SectionTitle icon={Download}>Export</SectionTitle>
            <p className="text-xs text-zinc-500">Applique le watermark actuel à l’image sélectionnée ou à toutes les images en mode batch.</p>
            <div className="grid grid-cols-1 gap-2">
              <ExportPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// The ExportPanel content will be injected by context below so we can access export funcs
const ExportPanelContext = React.createContext({ exportPNGorZIP: () => {}, exportPDF: () => {} });
function ExportPanelInner() {
  const { exportPNGorZIP, exportPDF } = React.useContext(ExportPanelContext);
  return (
    <div className="space-y-2">
      <button onClick={exportPNGorZIP} className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center gap-2"><FileImage className="w-4 h-4"/> Export PNG (ZIP si multiples)</button>
      <button onClick={exportPDF} className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center gap-2"><FileDown className="w-4 h-4"/> Export PDF (multi-page)</button>
    </div>
  );
}
function ExportPanel() { return <ExportPanelInner/>; }

// ----------------------- Main Module -----------------------
export default function WatermarkStudio() {
  const {
    images, selected, selectedId, setSelectedId, addFiles, removeImage,
    textWM, setTextWM,
    logoWM, setLogoWM, setLogoFile,
    filters, setFilters,
    commit, undo, redo, reset,
  } = useWatermarkEditor();

  const { canvasRef, viewportScale, fitToContainer } = useCanvas({ selected, textWM, logoWM, filters });
  const { exportPNGorZIP, exportPDF } = useBatchExport({ images: useMemo(() => selected ? [selected] : [], [selected]), textWM, logoWM, filters });
  const { exportPNGorZIP: exportAllPNGs, exportPDF: exportAllPDF } = useBatchExport({ images, textWM, logoWM, filters });

  const [tab, setTab] = useState("import");

  const quickPos = useCallback((code, target) => {
    const c = canvasRef.current; if (!c) return;
    const pad = 16; // margin
    // compute boxes
    let w = 120, h = 40; // default guess
    if (target === "text") { w = Math.max(40, textWM.fontSize * (textWM.text.length * 0.6)); h = Math.max(20, textWM.fontSize * 1.2); }
    if (target === "logo" && logoWM?.imgEl) {
      const minSide = Math.min(c.width, c.height);
      const size = Math.max(8, logoWM.scale * minSide);
      const aspect = logoWM.imgEl.width / logoWM.imgEl.height;
      w = aspect >= 1 ? size : size * aspect;
      h = aspect >= 1 ? size / aspect : size;
    }
    const pos = { x: pad, y: pad };
    if (code.includes("C")) pos.x = (c.width - w) / 2;
    if (code.endsWith("R")) pos.x = c.width - w - pad;
    if (code.startsWith("C")) pos.y = (c.height - h) / 2;
    if (code.startsWith("B")) pos.y = c.height - h - pad;

    if (target === "text") setTextWM(t => ({ ...t, x: Math.round(pos.x), y: Math.round(pos.y) }));
    if (target === "logo") setLogoWM(l => ({ ...l, x: Math.round(pos.x), y: Math.round(pos.y) }));
    commit("quick-pos");
  }, [canvasRef, textWM, logoWM, setTextWM, setLogoWM, commit]);

  const setZoom = useCallback((delta) => {
    const c = canvasRef.current; if (!c || !selected?.imgEl) return;
    const parent = c.parentElement; if (!parent) return;
    const imgW = selected.imgEl.width; const imgH = selected.imgEl.height;
    const curScale = c.width / imgW;
    const newScale = clamp(curScale + delta, 0.1, 1);
    c.width = Math.floor(imgW * newScale);
    c.height = Math.floor(imgH * newScale);
    fitToContainer();
  }, [canvasRef, selected, fitToContainer]);

  // Provide export funcs to ExportPanel depending on tab selection: if tab is Export, use all images; else selection
  const exportCtxValue = useMemo(() => ({ exportPNGorZIP: tab === "export" ? exportAllPNGs : exportPNGorZIP, exportPDF: tab === "export" ? exportAllPDF : exportPDF }), [tab, exportAllPNGs, exportPNGorZIP, exportAllPDF, exportPDF]);

  return (
    <ExportPanelContext.Provider value={exportCtxValue}>
      <div className="h-full w-full p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xl font-semibold">Watermark Studio</div>
          <div className="flex items-center gap-2">
            <ToolbarButton icon={Undo2} label="Undo" onClick={undo} />
            <ToolbarButton icon={Redo2} label="Redo" onClick={redo} />
            <ToolbarButton icon={RotateCw} label="Reset" onClick={reset} />
            <ToolbarButton icon={CopyCheck} label="Appliquer à toutes" onClick={() => {/* state already shared, nothing needed */}} />
            <ToolbarButton icon={ZoomOut} label="-" onClick={() => setZoom(-0.1)} />
            <ToolbarButton icon={ZoomIn} label="+" onClick={() => setZoom(0.1)} />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
          <aside className="col-span-12 md:col-span-4 lg:col-span-3 h-full overflow-auto">
            <SidebarControls
              tab={tab}
              setTab={setTab}
              addFiles={addFiles}
              textWM={textWM}
              setTextWM={(fn) => { setTextWM(fn); }}
              logoWM={logoWM}
              setLogoFile={setLogoFile}
              filters={filters}
              setFilters={setFilters}
              quickPos={quickPos}
            />
          </aside>

          <main className="col-span-12 md:col-span-8 lg:col-span-6 h-full">
            <EditorCanvas
              canvasRef={canvasRef}
              selected={selected}
              textWM={textWM}
              logoWM={logoWM}
              setTextWM={(fn) => { setTextWM(fn); }}
              setLogoWM={(fn) => { setLogoWM(fn); }}
              viewportScale={viewportScale}
            />
            <div className="mt-3">
              <SectionTitle icon={Grid2X2}>Images importées</SectionTitle>
              <ImageGrid images={images} selectedId={selectedId} setSelectedId={setSelectedId} removeImage={removeImage} />
            </div>
          </main>

          <aside className="col-span-12 lg:col-span-3 h-full overflow-auto hidden lg:block">
            <div className="p-3 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 sticky top-0">
              <SectionTitle icon={Download}>Export rapide (sélection)</SectionTitle>
              <div className="mt-2">
                <ExportPanel />
              </div>
            </div>
          </aside>
        </div>

      </div>
    </ExportPanelContext.Provider>
  );
}
