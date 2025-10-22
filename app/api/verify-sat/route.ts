import { NextResponse } from "next/server";

type RespOk = { rfc?: string; nombre?: string; domicilio?: string; raw?: string; info?: any };
type RespErr = { error: string; info?: any; rawSnippet?: string };

function safeTrim(s: any) { return typeof s === "string" ? s.trim() : s; }
function short(s?: string, n = 2000) { return typeof s === "string" ? s.slice(0, n) : s; }

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let { url } = body ?? {};
    if (!url || typeof url !== "string") return NextResponse.json({ error: "Falta url" } as RespErr, { status: 400 });
    url = safeTrim(url);
    let encodedUrl: string;
    try { encodedUrl = encodeURI(url); } catch { encodedUrl = url; }

    // ---------- Cambio: usar fetch nativo (globalThis.fetch) ----------
    const maybeFetch = (globalThis as any).fetch;
    if (!maybeFetch) {
      return NextResponse.json({ error: "Environment does not provide fetch" } as RespErr, { status: 500 });
    }
    const fetchFn: typeof fetch = maybeFetch;
    // ------------------------------------------------------------------

    const baseHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
      "Referer": "https://siat.sat.gob.mx/",
      "Accept-Encoding": "gzip, deflate, br",
    };

    const resp = await fetchFn(encodedUrl, { method: "GET", redirect: "follow", headers: baseHeaders });
    const status = resp.status;
    const finalUrl = (resp as any).url ?? encodedUrl;
    const contentType = (resp.headers && (resp.headers.get?.("content-type") ?? "")) || "";

    const arrayBuffer = await resp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const isPdf = buffer.slice(0, 4).toString() === "%PDF";
    let text = "";
    if (!isPdf) {
      try {
        text = buffer.toString("utf8");
      } catch (e) {
        text = "";
      }
    }

    if (!(status >= 200 && status < 300)) {
      return NextResponse.json({
        error: `Fetch returned HTTP ${status}`,
        info: { finalUrl, status, contentType, isPdf },
        rawSnippet: short(isPdf ? buffer.toString("base64").slice(0, 1000) : text, 2000)
      } as RespErr, { status: 502 });
    }

    try {
      if (isPdf || String(contentType).toLowerCase().includes("application/pdf") || encodedUrl.toLowerCase().endsWith(".pdf")) {
        const pdfParseMod: any = await import("pdf-parse");
        const pdfParse = pdfParseMod?.default ?? pdfParseMod;
        const pdfData: any = await pdfParse(buffer);
        const extractedText: string = pdfData?.text ?? "";
        const rfc = (extractedText.match(/\b([A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3,})\b/i)?.[1] ?? "").toUpperCase() || undefined;
        const nombre = extractedText.match(/(Nombre|Denominaci[oó]n fiscal)[:\s\-]*([^\n]+)/i)?.[2]?.trim() ?? undefined;
        const domicilio = extractedText.match(/Domicilio(?: fiscal)?[:\s\-]*([\s\S]{10,300})/i)?.[1]?.trim() ?? undefined;

        return NextResponse.json({ rfc, nombre, domicilio, raw: short(extractedText, 3000), info: { finalUrl, contentType } } as RespOk, { status: 200 });
      } else {
        const cheerioMod: any = await import("cheerio");
        const load = cheerioMod.load ?? (cheerioMod.default?.load ?? cheerioMod);
        const $ = load(text || "");
        const liText = $("li").text() || "";
        let rfc = liText.match(/\b([A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3,})\b/i)?.[1]?.toUpperCase();
        let nombre: string | undefined;
        const labelNodes = $("span").filter((i: number, el: any) => {
          const t = $(el).text().trim().toLowerCase();
          return t.includes("denominación") || t.includes("razón social") || t.includes("denominacion");
        });
        if (labelNodes && labelNodes.length > 0) {
          labelNodes.each((i: number, el: any) => {
            const td = $(el).closest("tr").find("td").eq(1);
            const txt = td.text().trim();
            if (txt && !nombre) nombre = txt;
          });
        }
        if (!nombre) {
          const m = text.match(/Denominaci[oó]n o Raz[oó]n Social[:\s]*<\/span>\s*<\/td>\s*<td[^>]*>([^<]+)/i)
            || text.match(/Denominaci[oó]n o Raz[oó]n Social[:\s]*<\/td>\s*<td[^>]*>([^<]+)/i);
          if (m) nombre = (m[1] || "").trim();
        }
        const entidad = text.match(/<span[^>]*>\s*Entidad Federativa:\s*<\/span>\s*<\/td>\s*<td[^>]*>([^<]+)/i)?.[1]?.trim();
        const municipio = text.match(/<span[^>]*>\s*Municipio o delegaci[oó]n:\s*<\/span>\s*<\/td>\s*<td[^>]*>([^<]+)/i)?.[1]?.trim();
        const vial = text.match(/<span[^>]*>\s*Nombre de la vialidad:\s*<\/span>\s*<\/td>\s*<td[^>]*>([^<]+)/i)?.[1]?.trim();
        const numExt = text.match(/<span[^>]*>\s*N[uú]mero exterior:\s*<\/span>\s*<\/td>\s*<td[^>]*>([^<]+)/i)?.[1]?.trim();
        const cp = text.match(/<span[^>]*>\s*CP:\s*<\/span>\s*<\/td>\s*<td[^>]*>([^<]+)/i)?.[1]?.trim();

        const parts: string[] = [];
        if (vial) parts.push(vial);
        if (numExt) parts.push(numExt);
        if (municipio) parts.push(municipio);
        if (entidad) parts.push(entidad);
        if (cp) parts.push("C.P. " + cp);
        const domicilio = parts.length ? parts.join(", ") : (text.match(/Domicilio(?: fiscal)?[:\s\-]*([^<\n]{10,300})/i)?.[1]?.trim() ?? undefined);

        if (!rfc) {
          const anyMatch = text.match(/\b([A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3,})\b/i);
          if (anyMatch) rfc = anyMatch[1].toUpperCase();
        }

        return NextResponse.json({ rfc, nombre, domicilio, raw: short(text, 3000), info: { finalUrl, contentType } } as RespOk, { status: 200 });
      }
    } catch (parseErr: any) {
      const stack = (parseErr && parseErr.stack) ? String(parseErr.stack).split("\n").slice(0,4).join("\n") : String(parseErr);
      return NextResponse.json({
        error: "Error parseando respuesta",
        info: { finalUrl, contentType, isPdf },
        rawSnippet: short(isPdf ? buffer.toString("base64").slice(0,1000) : text, 2000),
      } as RespErr, { status: 500 });
    }
  } catch (err: any) {
    const stack = (err && err.stack) ? String(err.stack).split("\n").slice(0,4).join("\n") : String(err);
    return NextResponse.json({ error: "Error interno: " + (err?.message ?? String(err)), info: { stack: short(stack, 1000) } } as RespErr, { status: 500 });
  }
}
