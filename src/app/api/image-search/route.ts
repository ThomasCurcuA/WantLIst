import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const searchQuery = query.trim().slice(0, 100);
    const images: string[] = [];

    // Strategy 1: Bing Image Search (scrape HTML for image URLs)
    try {
      const bingUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(searchQuery + " product")}&first=1&count=12`;
      const response = await fetch(bingUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const html = await response.text();

        // Extract image URLs from Bing's data attributes (murl = media url)
        const murlRegex = /murl&quot;:&quot;(https?:\/\/[^&]+?)&quot;/g;
        let match;
        while ((match = murlRegex.exec(html)) !== null && images.length < 12) {
          const url = decodeURIComponent(match[1]);
          if (isValidImageUrl(url) && !images.includes(url)) {
            images.push(url);
          }
        }

        // Fallback: try to extract from turl (thumbnail url)
        if (images.length < 4) {
          const turlRegex = /turl&quot;:&quot;(https?:\/\/[^&]+?)&quot;/g;
          while ((match = turlRegex.exec(html)) !== null && images.length < 12) {
            const url = decodeURIComponent(match[1]);
            if (isValidImageUrl(url) && !images.includes(url)) {
              images.push(url);
            }
          }
        }
      }
    } catch {
      // Bing failed, continue to fallback
    }

    // Strategy 2: DuckDuckGo vqd token + image API
    if (images.length < 4) {
      try {
        // First get vqd token
        const ddgTokenUrl = `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`;
        const tokenResp = await fetch(ddgTokenUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          signal: AbortSignal.timeout(5000),
        });

        if (tokenResp.ok) {
          const tokenHtml = await tokenResp.text();
          const vqdMatch = /vqd=['"]([^'"]+)/.exec(tokenHtml);

          if (vqdMatch) {
            const vqd = vqdMatch[1];
            const ddgImgUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(searchQuery)}&vqd=${vqd}&f=,,,,,&p=1`;
            const imgResp = await fetch(ddgImgUrl, {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                Referer: "https://duckduckgo.com/",
              },
              signal: AbortSignal.timeout(5000),
            });

            if (imgResp.ok) {
              const data = await imgResp.json();
              if (data.results) {
                for (const r of data.results) {
                  if (r.image && isValidImageUrl(r.image) && !images.includes(r.image) && images.length < 12) {
                    images.push(r.image);
                  }
                }
              }
            }
          }
        }
      } catch {
        // DDG failed too
      }
    }

    return NextResponse.json({ images });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function isValidImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (!u.protocol.startsWith("http")) return false;
    // Filter out tiny tracking pixels and icons
    const ext = u.pathname.toLowerCase();
    const isImage = /\.(jpg|jpeg|png|webp|gif|avif)(\?|$)/i.test(ext) || ext.includes("image");
    // Exclude common tracking domains
    const excluded = ["facebook.com", "google-analytics", "doubleclick", "pixel", "tracker", "1x1"];
    if (excluded.some((e) => url.includes(e))) return false;
    return isImage || !ext.includes(".");
  } catch {
    return false;
  }
}
