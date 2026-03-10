import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const targetUrl = parsed.toString();
    const results: ScrapeResult[] = [];

    // Try all strategies in parallel for speed
    const [jinaResult, directResult] = await Promise.allSettled([
      tryJinaReader(targetUrl),
      tryDirectFetch(targetUrl),
    ]);

    if (jinaResult.status === "fulfilled" && jinaResult.value) results.push(jinaResult.value);
    if (directResult.status === "fulfilled" && directResult.value) results.push(directResult.value);

    // If both failed, try proxy
    if (results.length === 0) {
      const proxyResult = await tryAllOriginsProxy(targetUrl);
      if (proxyResult) results.push(proxyResult);
    }

    if (results.length === 0) {
      return NextResponse.json(
        { error: "Could not extract product data. Try adding the product manually." },
        { status: 422 }
      );
    }

    // Merge best data from all results
    const merged = mergeResults(results);
    merged.name = cleanProductName(merged.name);

    return NextResponse.json(merged);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface ScrapeResult {
  name: string;
  price: number | null;
  image_url: string | null;
  notes: string | null;
}

/** Merge multiple scrape results: pick the best field from each */
function mergeResults(results: ScrapeResult[]): ScrapeResult {
  const best: ScrapeResult = { name: "", price: null, image_url: null, notes: null };

  for (const r of results) {
    // Prefer shorter, cleaner names (likely more product-specific)
    if (r.name && (!best.name || (r.name.length < best.name.length && r.name.length > 5))) {
      best.name = r.name;
    } else if (r.name && !best.name) {
      best.name = r.name;
    }
    // Prefer non-null price
    if (r.price !== null && best.price === null) best.price = r.price;
    // Prefer non-null image
    if (r.image_url && !best.image_url) best.image_url = r.image_url;
    // Prefer longer notes (more descriptive)
    if (r.notes && (!best.notes || r.notes.length > best.notes.length)) best.notes = r.notes;
  }

  return best;
}

/** Clean product name: remove site suffixes, clean up */
function cleanProductName(name: string): string {
  if (!name) return name;

  // Remove common site suffixes: "Product Name | Amazon.com", "Product - Site"
  let clean = name
    .replace(/\s*[\|–—-]\s*(Amazon|eBay|Walmart|Target|Best Buy|Etsy|AliExpress|SHEIN|ASOS|Zalando|Nike|Adidas|H&M|Zara|IKEA|Apple|Samsung).*$/i, "")
    .replace(/\s*[\|–—-]\s*[A-Z][a-zA-Z]*\.(com|it|co\.uk|de|fr|es).*$/i, "")
    .replace(/\s*[\|–—-]\s*Acquista online.*$/i, "")
    .replace(/\s*[\|–—-]\s*Buy online.*$/i, "")
    .replace(/\s*[\|–—-]\s*Shop.*$/i, "")
    .replace(/\s*[\|–—-]\s*Official Site.*$/i, "")
    .replace(/\s*[\|–—-]\s*Sito Ufficiale.*$/i, "")
    .trim();

  // If name is still very long, try to take first meaningful part
  if (clean.length > 120) {
    // Split on common separators and take the first part
    const parts = clean.split(/\s*[\|–—]\s*/);
    if (parts[0] && parts[0].length > 10) {
      clean = parts[0].trim();
    }
  }

  return clean.slice(0, 200);
}

// ============ Strategy 1: Jina Reader ============

async function tryJinaReader(url: string): Promise<ScrapeResult | null> {
  try {
    const response = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        Accept: "application/json",
        "X-Return-Format": "json",
        "X-No-Cache": "true",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return null;

    const text = await response.text();

    // Try parsing as JSON first
    try {
      const json = JSON.parse(text);
      const data = json.data || json;
      const title = data.title || "";
      const description = data.description || "";
      const content = data.content || "";
      const imageUrl = data.image || null;

      // Try to find price in content
      const price = extractPriceFromText(content) || extractPriceFromText(description);

      // Try to find better image in content if none from metadata
      let bestImage = imageUrl;
      if (!bestImage && content) {
        const imgMatch = content.match(/!\[.*?\]\((https?:\/\/[^\s)]+(?:\.jpg|\.jpeg|\.png|\.webp)[^\s)]*)\)/i);
        if (imgMatch) bestImage = imgMatch[1];
      }

      if (title) {
        return {
          name: title.trim().slice(0, 200),
          price,
          image_url: bestImage,
          notes: description ? description.trim().slice(0, 500) : null,
        };
      }
    } catch {
      // Not JSON, parse as markdown
    }

    return parseJinaMarkdown(text);
  } catch {
    return null;
  }
}

function parseJinaMarkdown(markdown: string): ScrapeResult | null {
  let name = "";
  let notes = "";
  let imageUrl: string | null = null;

  const titleMatch = markdown.match(/^Title:\s*(.+)$/m) || markdown.match(/^#\s+(.+)$/m);
  if (titleMatch) name = titleMatch[1].trim();

  // Extract images - prefer product-looking ones
  const imgRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
  let imgM;
  while ((imgM = imgRegex.exec(markdown)) !== null) {
    const imgUrl = imgM[1];
    if (/\.(jpg|jpeg|png|webp)/i.test(imgUrl) && !imgUrl.includes("logo") && !imgUrl.includes("icon") && !imgUrl.includes("favicon")) {
      imageUrl = imgUrl;
      break;
    }
  }

  // Extract description from markdown content
  const lines = markdown.split("\n").filter(l => l.trim() && !l.startsWith("#") && !l.startsWith("Title:") && !l.startsWith("!["));
  if (lines.length > 0) {
    notes = lines.slice(0, 3).join(" ").trim().slice(0, 500);
  }

  const price = extractPriceFromText(markdown);

  if (!name) return null;
  return { name: name.slice(0, 200), price, image_url: imageUrl, notes: notes || null };
}

// ============ Strategy 2: Direct fetch ============

async function tryDirectFetch(url: string): Promise<ScrapeResult | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,it;q=0.8",
      },
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
    });

    if (!response.ok) return null;
    const html = await response.text();
    return extractFromHtml(html, url);
  } catch {
    return null;
  }
}

// ============ Strategy 3: AllOrigins proxy ============

async function tryAllOriginsProxy(url: string): Promise<ScrapeResult | null> {
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl, {
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return null;
    const html = await response.text();
    return extractFromHtml(html, url);
  } catch {
    return null;
  }
}

// ============ HTML extraction ============

function extractFromHtml(html: string, sourceUrl: string): ScrapeResult | null {
  const isAmazon = /amazon\.(com|it|co\.uk|de|fr|es|ca|com\.au|co\.jp|in)/i.test(sourceUrl);

  // 1. Try JSON-LD first (most reliable for product data)
  const jsonLdData = extractJsonLdProduct(html);

  // 2. Extract from meta tags
  const ogTitle = extractMeta(html, "og:title");
  const ogDesc = extractMeta(html, "og:description");
  const ogImage = extractMeta(html, "og:image");
  const twitterImage = extractMeta(html, "twitter:image");
  const metaDesc = extractMeta(html, "description");
  const pageTitle = extractTag(html, "title");

  // Build name: prefer JSON-LD product name, then og:title, then <title>
  let name = jsonLdData.name || ogTitle || pageTitle || "";
  let notes = jsonLdData.description || ogDesc || metaDesc || null;

  // Build price: prefer JSON-LD, then meta tags, then HTML patterns
  let price = jsonLdData.price;
  if (price === null) {
    const ogPrice = extractMeta(html, "og:price:amount") || extractMeta(html, "product:price:amount");
    if (ogPrice) {
      const p = parsePrice(ogPrice);
      if (p !== null) price = p;
    }
  }
  if (price === null) {
    price = isAmazon ? extractAmazonPrice(html) : extractPriceFromHtml(html);
  }

  // Build image: for Amazon, use dedicated extraction; otherwise standard flow
  let image_url: string | null = null;
  if (isAmazon) {
    image_url = extractAmazonImage(html);
  }
  if (!image_url) {
    image_url = jsonLdData.image || ogImage || twitterImage || null;
  }

  // Make relative image URLs absolute
  if (image_url && !image_url.startsWith("http")) {
    try {
      image_url = new URL(image_url, sourceUrl).toString();
    } catch { /* ignore */ }
  }

  // If still no image, try to find one in HTML
  if (!image_url) {
    image_url = extractProductImage(html, sourceUrl);
  }

  if (!name.trim()) return null;

  return {
    name: name.trim().slice(0, 200),
    price,
    image_url,
    notes: notes ? notes.trim().slice(0, 500) : null,
  };
}

/** Extract structured product data from JSON-LD */
function extractJsonLdProduct(html: string): { name: string; price: number | null; image: string | null; description: string | null } {
  const result = { name: "", price: null as number | null, image: null as string | null, description: null as string | null };

  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let jsonMatch;

  while ((jsonMatch = jsonLdRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(jsonMatch[1]);
      const product = findProductInJsonLd(data);
      if (product) {
        if (product.name) result.name = String(product.name);
        if (product.description) result.description = String(product.description).slice(0, 500);

        // Extract price from offers
        if (product.offers) {
          const offers = Array.isArray(product.offers) ? product.offers : [product.offers];
          for (const offer of offers) {
            if (offer && typeof offer === "object") {
              const o = offer as Record<string, unknown>;
              const p = parsePrice(String(o.price ?? o.lowPrice ?? ""));
              if (p !== null) { result.price = p; break; }
            }
          }
        }
        if (result.price === null && product.price !== undefined) {
          result.price = parsePrice(String(product.price));
        }

        // Extract image
        if (product.image) {
          if (typeof product.image === "string") {
            result.image = product.image;
          } else if (Array.isArray(product.image)) {
            result.image = typeof product.image[0] === "string" ? product.image[0] : (product.image[0] as Record<string, unknown>)?.url as string || null;
          } else if (typeof product.image === "object") {
            result.image = (product.image as Record<string, unknown>)?.url as string || null;
          }
        }

        if (result.name) break; // Found a product, stop searching
      }
    } catch { /* ignore parse errors */ }
  }

  return result;
}

/** Recursively find a Product-type object in JSON-LD data */
function findProductInJsonLd(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object") return null;

  if (Array.isArray(data)) {
    for (const item of data) {
      const p = findProductInJsonLd(item);
      if (p) return p;
    }
    return null;
  }

  const obj = data as Record<string, unknown>;
  const type = String(obj["@type"] || "").toLowerCase();

  if (type === "product" || type === "offer" || type === "individualproduct") {
    return obj;
  }

  // Check @graph
  if (obj["@graph"]) {
    return findProductInJsonLd(obj["@graph"]);
  }

  // Check mainEntity
  if (obj.mainEntity) {
    return findProductInJsonLd(obj.mainEntity);
  }

  return null;
}

/** Extract product image from HTML when meta tags don't have one */
function extractProductImage(html: string, sourceUrl: string): string | null {
  // Try data-src, data-lazy-src first (lazy-loaded images)
  const lazyPatterns = [
    /<img[^>]*(?:data-src|data-lazy-src|data-original)=["'](https?:\/\/[^"']+)["'][^>]*>/gi,
    /<img[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/gi,
  ];

  for (const pattern of lazyPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const src = match[1];
      // Skip non-product images
      if (isLikelyProductImage(src)) {
        return src;
      }
    }
  }

  // Try srcset
  const srcsetMatch = /<img[^>]*srcset=["']([^"']+)["'][^>]*>/i.exec(html);
  if (srcsetMatch) {
    const entries = srcsetMatch[1].split(",").map(s => s.trim().split(/\s+/));
    // Pick largest image
    let bestUrl = "";
    let bestSize = 0;
    for (const [imgUrl, size] of entries) {
      const s = parseInt(size) || 0;
      if (s > bestSize && imgUrl.startsWith("http")) {
        bestSize = s;
        bestUrl = imgUrl;
      }
    }
    if (bestUrl) return bestUrl;
  }

  return null;
}

function isLikelyProductImage(url: string): boolean {
  const lower = url.toLowerCase();
  // Skip obviously non-product images
  if (lower.includes("logo") || lower.includes("icon") || lower.includes("favicon") ||
      lower.includes("sprite") || lower.includes("pixel") || lower.includes("1x1") ||
      lower.includes("tracking") || lower.includes("spacer") || lower.includes("banner") ||
      lower.includes("avatar") || lower.includes("badge")) return false;
  if (/\.(svg|ico|gif)(\?|$)/i.test(lower)) return false;
  // Should look like an image
  return /\.(jpg|jpeg|png|webp|avif)/i.test(lower) || lower.includes("image") || lower.includes("/img/") || lower.includes("/product");
}

// ============ Amazon-specific extraction ============

/** Extract the main product image from Amazon HTML */
function extractAmazonImage(html: string): string | null {
  // 1. Try data-a-dynamic-image (JSON object with image URLs as keys)
  const dynamicImgMatch = /data-a-dynamic-image=["']\{([^}]+)\}["']/i.exec(html);
  if (dynamicImgMatch) {
    try {
      const obj = JSON.parse(`{${dynamicImgMatch[1].replace(/&quot;/g, '"')}}`);
      // Pick the largest image (highest resolution)
      let bestUrl = "";
      let bestSize = 0;
      for (const [url, dims] of Object.entries(obj)) {
        const [w, h] = Array.isArray(dims) ? dims : [0, 0];
        const size = (w as number) * (h as number);
        if (size > bestSize) {
          bestSize = size;
          bestUrl = url;
        }
      }
      if (bestUrl) return bestUrl;
    } catch { /* ignore */ }
  }

  // 2. Try data-old-hires attribute (high-res product image)
  const hiResMatch = /data-old-hires=["'](https?:\/\/[^"']+)["']/i.exec(html);
  if (hiResMatch && isLikelyProductImage(hiResMatch[1])) return hiResMatch[1];

  // 3. Try imgTagWrapperId or landingImage
  const landingMatch = /id=["']landingImage["'][^>]*src=["'](https?:\/\/[^"']+)["']/i.exec(html);
  if (landingMatch) return landingMatch[1];

  // 4. Try data-a-hires
  const aHiresMatch = /data-a-hires=["'](https?:\/\/[^"']+)["']/i.exec(html);
  if (aHiresMatch) return aHiresMatch[1];

  // 5. Try Amazon image pattern in img tags (images-amazon.com or m.media-amazon.com)
  const amazonImgRegex = /<img[^>]*src=["'](https?:\/\/(?:images-na\.ssl-images-amazon|m\.media-amazon|images-eu\.ssl-images-amazon)[^"']+)["'][^>]*>/gi;
  let match;
  while ((match = amazonImgRegex.exec(html)) !== null) {
    const src = match[1];
    // Skip tiny images (icons, sprites), look for product images
    if (!src.includes("._SS") && !src.includes("._US40") && !src.includes("._CR") && !src.includes("sprite") && !src.includes("icon")) {
      return src;
    }
  }

  return null;
}

/** Extract price from Amazon HTML */
function extractAmazonPrice(html: string): number | null {
  // Try span.a-price .a-offscreen (current Amazon price format)
  const offscreenMatch = /class=["'][^"']*a-price[^"']*["'][^>]*>[\s\S]*?class=["']a-offscreen["'][^>]*>([\s\S]*?)<\/span>/i.exec(html);
  if (offscreenMatch) {
    const p = parsePrice(offscreenMatch[1].replace(/<[^>]*>/g, "").trim());
    if (p !== null) return p;
  }

  // Try priceblock_ourprice or priceblock_dealprice
  const priceBlockMatch = /id=["'](?:priceblock_ourprice|priceblock_dealprice|price_inside_buybox|corePrice_feature_div)["'][^>]*>[\s\S]*?[\$€£]([\d.,]+)/i.exec(html);
  if (priceBlockMatch) {
    const p = parsePrice(priceBlockMatch[1]);
    if (p !== null) return p;
  }

  // Try generic price patterns
  return extractPriceFromHtml(html);
}

// ============ Price extraction ============

function parsePrice(s: string): number | null {
  if (!s) return null;
  // Remove currency symbols and spaces
  let clean = s.replace(/[^\d.,]/g, "").trim();
  if (!clean) return null;

  // Handle European format: 1.234,56
  if (/^\d{1,3}(\.\d{3})+(,\d{2})?$/.test(clean)) {
    clean = clean.replace(/\./g, "").replace(",", ".");
  }
  // Handle: 1234,56
  else if (/^\d+,\d{2}$/.test(clean)) {
    clean = clean.replace(",", ".");
  }
  // Handle: 1,234.56
  else {
    clean = clean.replace(/,/g, "");
  }

  const p = parseFloat(clean);
  if (!isNaN(p) && p > 0 && p < 1000000) return p;
  return null;
}

function extractPriceFromHtml(html: string): number | null {
  // Try microdata
  const microdataMatch = /itemprop=["']price["'][^>]*content=["']([^"']+)["']/i.exec(html);
  if (microdataMatch) {
    const p = parsePrice(microdataMatch[1]);
    if (p !== null) return p;
  }

  // Try data-price attributes
  const dataPriceMatch = /data-price=["']([^"']+)["']/i.exec(html);
  if (dataPriceMatch) {
    const p = parsePrice(dataPriceMatch[1]);
    if (p !== null) return p;
  }

  // Try price class elements
  const priceClassPatterns = [
    /class=["'][^"']*(?:product-price|price-current|sale-price|current-price|final-price)[^"']*["'][^>]*>[\s\S]*?[\$€£]([\d.,]+)/i,
    /class=["'][^"']*price[^"']*["'][^>]*>\s*[\$€£]\s*([\d.,]+)/i,
    /class=["'][^"']*price[^"']*["'][^>]*>\s*([\d.,]+)\s*[\$€£]/i,
  ];

  for (const pattern of priceClassPatterns) {
    const match = pattern.exec(html);
    if (match) {
      const p = parsePrice(match[1]);
      if (p !== null) return p;
    }
  }

  return null;
}

function extractPriceFromText(text: string): number | null {
  // Price with currency symbol
  const patterns = [
    /[\$€£]\s*([\d]+[.,]\d{2})/,
    /([\d]+[.,]\d{2})\s*[\$€£]/,
    /(?:price|prezzo|costo|precio)[\s:]*[\$€£]?\s*([\d.,]+)/i,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      const p = parsePrice(match[1]);
      if (p !== null) return p;
    }
  }
  return null;
}

// ============ Meta extraction helpers ============

function extractMeta(html: string, property: string): string | null {
  const escaped = escapeRegex(property);
  const patterns = [
    new RegExp(`<meta[^>]*property=["']${escaped}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${escaped}["']`, "i"),
    new RegExp(`<meta[^>]*name=["']${escaped}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${escaped}["']`, "i"),
  ];

  for (const regex of patterns) {
    const match = regex.exec(html);
    if (match) return decodeHtmlEntities(match[1]);
  }
  return null;
}

function extractTag(html: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i");
  const match = regex.exec(html);
  return match ? decodeHtmlEntities(match[1]) : null;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)));
}
