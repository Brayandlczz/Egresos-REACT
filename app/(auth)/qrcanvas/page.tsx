"use client";
import React, { useRef, useState, useCallback } from "react";
import jsQR from "jsqr";

type QRResult = {
  text: string;
  location?: {
    topLeftCorner: { x: number; y: number };
    topRightCorner: { x: number; y: number };
    bottomRightCorner: { x: number; y: number };
    bottomLeftCorner: { x: number; y: number };
  };
} | null;

export default function QRCanvasDemo() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [qr, setQr] = useState<QRResult>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState<{ rfc?: string; nombre?: string; domicilio?: string }>({});
  const [verifying, setVerifying] = useState(false);
  const [lastVerifiedUrl, setLastVerifiedUrl] = useState<string | null>(null);

  const MAX_DIM = 1600;
  const MAX_PAGES_TO_CHECK = 5;

  const reset = () => {
    setQr(null);
    setError(null);
    setFormData({});
    setLastVerifiedUrl(null);
    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch {}
    }
    setPreviewUrl(null);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const drawBoundingBox = (ctx: CanvasRenderingContext2D, loc: any) => {
    if (!loc) return;
    ctx.strokeStyle = "red";
    ctx.lineWidth = Math.max(2, Math.min(6, (ctx.canvas.width + ctx.canvas.height) / 600));
    ctx.beginPath();
    ctx.moveTo(loc.topLeftCorner.x, loc.topLeftCorner.y);
    ctx.lineTo(loc.topRightCorner.x, loc.topRightCorner.y);
    ctx.lineTo(loc.bottomRightCorner.x, loc.bottomRightCorner.y);
    ctx.lineTo(loc.bottomLeftCorner.x, loc.bottomLeftCorner.y);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = "red";
    [loc.topLeftCorner, loc.topRightCorner, loc.bottomRightCorner, loc.bottomLeftCorner].forEach(
      (p: any) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Texto copiado al portapapeles");
    } catch {
      alert("No se pudo copiar al portapapeles.");
    }
  };

  const looksLikeUrl = (s?: string) => {
    if (!s) return false;
    try {
      if (/https?:\/\//i.test(s)) return true;
      if (/sat\.gob|gob\.mx|verificacion|consulta/i.test(s)) return true;
      if (/token=|id=|folio|consulta/i.test(s)) return true;
      return false;
    } catch {
      return false;
    }
  };

  const fetchSatData = useCallback(async (tokenUrl: string) => {
    if (!tokenUrl) return null;
    if (lastVerifiedUrl && lastVerifiedUrl === tokenUrl) {
      return null;
    }
    setVerifying(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const resp = await fetch("/api/verify-sat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: tokenUrl }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const json = await resp.json().catch(() => null);
      if (!resp.ok) {
        const msg = (json && json.error) || `Error al verificar (HTTP ${resp.status})`;
        setError(msg);
        setVerifying(false);
        return null;
      }

      setFormData({
        rfc: json?.rfc ?? undefined,
        nombre: json?.nombre ?? undefined,
        domicilio: json?.domicilio ?? undefined,
      });
      setLastVerifiedUrl(tokenUrl);
      return json;
    } catch (e: any) {
      if (e.name === "AbortError") setError("Tiempo de espera agotado al consultar SAT.");
      else setError("Error comunicándose con el servidor: " + (e?.message ?? String(e)));
      return null;
    } finally {
      setVerifying(false);
    }
  }, [lastVerifiedUrl]);

  const handleFile = async (file?: File) => {
    reset();
    const f = file ?? fileRef.current?.files?.[0];
    if (!f) return;

    setProcessing(true);
    try {
      if (f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) {
        await processPdfFile(f);
      } else if (f.type.startsWith("image/")) {
        await processImageFile(f);
      } else {
        setError("Por favor sube una imagen (png, jpg, webp...) o un PDF.");
      }
    } catch (e: any) {
      console.error("handleFile error:", e);
      setError(e?.message ?? "Error desconocido.");
    } finally {
      setProcessing(false);
    }
  };

  const processImageFile = async (f: File) => {
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);

    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const ratio = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
          const w = Math.round(img.width * ratio);
          const h = Math.round(img.height * ratio);

          const canvas = canvasRef.current!;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("No se pudo obtener contexto 2D del canvas.");

          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);

          ctx.save();
          ctx.font = "12px system-ui";
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.fillText(`W:${w} H:${h}`, 8, h - 8);
          ctx.restore();

          const imageData = ctx.getImageData(0, 0, w, h);

          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            drawBoundingBox(ctx, code.location);
            const text = code.data;
            setQr({
              text,
              location: {
                topLeftCorner: code.location.topLeftCorner,
                topRightCorner: code.location.topRightCorner,
                bottomRightCorner: code.location.bottomRightCorner,
                bottomLeftCorner: code.location.bottomLeftCorner,
              },
            });

            if (looksLikeUrl(text)) {
              fetchSatData(text).catch((e)=>console.warn("verify err", e));
            }
          } else {
            setError("No se detectó un QR. Intenta con otra imagen o recorta la zona del QR.");
          }
          resolve();
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error("Error cargando la imagen."));
      img.src = url;
    });
  };

  const processPdfFile = async (f: File) => {
    try {
      if (typeof window === "undefined") {
        throw new Error("processPdfFile debe ejecutarse en el cliente (browser).");
      }

      const mod = await import("pdfjs-dist/legacy/build/pdf");
      const pdfjs: any = (mod && (mod.default ?? mod)) || null;
      console.log("[pdfjs] import result:", mod, "normalized:", pdfjs);

      if (!pdfjs) {
        throw new Error("No se pudo cargar pdfjs-dist (legacy). Asegúrate de tener la versión 2.x instalada.");
      }

      try {
        const gw = (pdfjs as any).GlobalWorkerOptions ?? (pdfjs.GlobalWorkerOptions as any);
        const cdnWorker = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

        if (gw && typeof gw === "object") {
          if (!gw.workerSrc) gw.workerSrc = cdnWorker;
          console.log("[pdfjs] GlobalWorkerOptions existente, workerSrc:", gw.workerSrc);
        } else {
          try {
            (pdfjs as any).GlobalWorkerOptions = { workerSrc: cdnWorker };
            console.log("[pdfjs] GlobalWorkerOptions creado via cast fallback.");
          } catch (eCreate) {
            console.warn("[pdfjs] No se pudo crear GlobalWorkerOptions, fallback activado. Error:", eCreate);
          }
        }
      } catch (gwErr) {
        console.warn("[pdfjs] No se pudo configurar GlobalWorkerOptions de forma directa:", gwErr);
      }

      const arrayBuffer = await f.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const numPages = pdf.numPages;
      console.log("[pdfjs] PDF cargado. páginas:", numPages);

      const pagesToCheck = Math.min(numPages, MAX_PAGES_TO_CHECK);
      let found = false;

      for (let i = 1; i <= pagesToCheck && !found; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.min(1, MAX_DIM / Math.max(viewport.width, viewport.height));
        const renderViewport = page.getViewport({ scale });

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = Math.round(renderViewport.width);
        tempCanvas.height = Math.round(renderViewport.height);
        const ctx = tempCanvas.getContext("2d");
        if (!ctx) throw new Error("No se pudo obtener contexto 2D para render del PDF.");

        await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;

        if (!previewUrl) {
          const blob = await new Promise<Blob | null>((res) => tempCanvas.toBlob((b) => res(b), "image/png"));
          if (blob) {
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
          }
        }

        try {
          const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            const visCanvas = canvasRef.current!;
            visCanvas.width = tempCanvas.width;
            visCanvas.height = tempCanvas.height;
            const visCtx = visCanvas.getContext("2d")!;
            visCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            visCtx.drawImage(tempCanvas, 0, 0);

            drawBoundingBox(visCtx, code.location);
            const text = code.data;
            setQr({
              text,
              location: {
                topLeftCorner: code.location.topLeftCorner,
                topRightCorner: code.location.topRightCorner,
                bottomRightCorner: code.location.bottomRightCorner,
                bottomLeftCorner: code.location.bottomLeftCorner,
              },
            });

            if (looksLikeUrl(text)) {
              await fetchSatData(text);
            }

            found = true;
            console.log("[pdfjs] QR detectado en página", i, code.data);
            break;
          } else {
            console.log("[pdfjs] No QR en página", i);
          }
        } catch (innerErr) {
          console.warn("[pdfjs] No se pudo extraer imageData o leer QR en página", i, innerErr);
        }
      }

      if (!found) {
        setError("No se detectó un QR en las primeras páginas del PDF.");
      }
    } catch (err: any) {
      console.error("processPdfFile error:", err);
      setError("Error procesando PDF: " + (err?.message ?? String(err)));
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const onVerifyClick = async () => {
    if (!qr?.text) {
      setError("No hay QR detectado para verificar.");
      return;
    }
    if (!looksLikeUrl(qr.text)) {
      setError("El contenido del QR no parece ser una URL/token para verificar en SAT.");
      return;
    }
    await fetchSatData(qr.text);
  };

  const onAcceptData = () => {
    alert("Datos aceptados:\n" + JSON.stringify(formData, null, 2));
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-lg font-semibold mb-3">Demostración: Renderizar imagen/PDF en canvas y leer QR</h2>

      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed p-4 rounded-lg mb-4 hover:border-orange-400 transition-colors"
      >
        <p className="text-sm text-gray-600 mb-2">
          Arrastra una imagen o un PDF aquí o selecciona uno. El sistema dibujará la página/imagen en un canvas y tratará de leer un QR.
        </p>

        <div className="flex gap-2 items-center">
          <label className="px-4 py-2 bg-orange-500 text-white rounded cursor-pointer">
            Seleccionar archivo
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={() => handleFile()}
            />
          </label>

          <button
            onClick={() => {
              reset();
              if (fileRef.current) fileRef.current.value = "";
            }}
            className="px-3 py-2 border rounded"
          >
            Limpiar
          </button>

          {processing && <span className="text-sm italic text-gray-600">Procesando...</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Previsualización</p>
          <div className="border rounded p-2 h-56 flex items-center justify-center overflow-hidden bg-white">
            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="object-contain w-full h-full" />
            ) : (
              <div className="text-sm text-gray-400">Aquí aparecerá la imagen o la primera página del PDF</div>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">Canvas (imagen renderizada + posible caja del QR)</p>
          <div className="border rounded p-2 bg-white">
            <canvas ref={canvasRef} className="w-full h-56 block" />
          </div>
        </div>
      </div>

      <div className="mb-4">
        {error && <div className="text-red-600 mb-2">{error}</div>}

        {qr ? (
          <div className="bg-green-50 border border-green-200 p-3 rounded">
            <div className="flex justify-between items-start">
              <div className="w-3/4">
                <h3 className="font-medium">QR detectado</h3>
                <p className="text-sm break-words mt-1">{qr.text}</p>
                {qr.location && (
                  <p className="text-xs text-gray-500 mt-1">Coordenadas aproximadas del QR en el canvas.</p>
                )}
                {verifying && <div className="text-sm text-gray-500 mt-2">Verificando en SAT...</div>}
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  className="px-3 py-1 border rounded text-sm"
                  onClick={() => copyToClipboard(qr.text)}
                >
                  Copiar
                </button>

                <a
                  className="px-3 py-1 bg-orange-500 text-white rounded text-sm"
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(qr.text)}`}
                  download="qr-data.txt"
                >
                  Descargar .txt
                </a>

                <button
                  className="px-3 py-1 border rounded text-sm"
                  onClick={onVerifyClick}
                  disabled={verifying}
                >
                  Verificar en SAT
                </button>
              </div>
            </div>
          </div>
        ) : (
          !processing && <div className="text-sm text-gray-500">Si el QR es detectado aparecerá aquí.</div>
        )}
      </div>

      <div className="bg-white border rounded p-3 mb-4">
        <h4 className="text-sm font-medium mb-2">Datos extraídos (revisa/edita antes de aceptar)</h4>
        <div className="grid grid-cols-1 gap-2">
          <label className="text-xs">RFC</label>
          <input
            value={formData.rfc ?? ""}
            onChange={(e) => setFormData((s) => ({ ...s, rfc: e.target.value }))}
            className="w-full border px-2 py-1 rounded"
            placeholder="RFC extraído"
          />
          <label className="text-xs">Nombre / Razón social</label>
          <input
            value={formData.nombre ?? ""}
            onChange={(e) => setFormData((s) => ({ ...s, nombre: e.target.value }))}
            className="w-full border px-2 py-1 rounded"
            placeholder="Nombre extraído"
          />
          <label className="text-xs">Domicilio</label>
          <textarea
            value={formData.domicilio ?? ""}
            onChange={(e) => setFormData((s) => ({ ...s, domicilio: e.target.value }))}
            className="w-full border px-2 py-1 rounded"
            placeholder="Domicilio extraído"
          />
          <div className="flex gap-2 justify-end mt-2">
            <button
              onClick={() => {
                setFormData({});
                setLastVerifiedUrl(null);
              }}
              className="px-3 py-1 border rounded text-sm"
            >
              Limpiar
            </button>
            <button
              onClick={onAcceptData}
              className="px-3 py-1 bg-orange-500 text-white rounded text-sm"
            >
              Aceptar datos
            </button>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Nota: esta integración **envía la URL/token** detectada por QR a tu API `/api/verify-sat` para que el servidor consulte y parsee los datos en el SAT. Esto evita CORS y protege tu lógica/UA. Revisa la consola para logs `"[pdfjs] import result:"` y `"[pdfjs] PDF cargado..."`.
      </div>
    </div>
  );
}
