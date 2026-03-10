"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function ShareHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Extract the shared URL from the query parameters
    // Different apps send the URL in different params
    const url = searchParams.get("url");
    const text = searchParams.get("text");
    const title = searchParams.get("title");

    // Try to find a URL — some apps put it in 'url', others in 'text'
    let sharedUrl = url || "";

    // If no direct URL, try to extract one from the text
    if (!sharedUrl && text) {
      const urlMatch = text.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        sharedUrl = urlMatch[0];
      }
    }

    // If still no URL, try the title (rare but possible)
    if (!sharedUrl && title) {
      const urlMatch = title.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        sharedUrl = urlMatch[0];
      }
    }

    // Redirect to home with the shared URL as a parameter
    if (sharedUrl) {
      router.replace(`/?shared_url=${encodeURIComponent(sharedUrl)}`);
    } else {
      // No URL found, just go home
      router.replace("/");
    }
  }, [searchParams, router]);

  // Show a brief loading state while redirecting
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F8F9FB]">
      <div className="w-20 h-20 rounded-[24px] bg-[#E93D5D] flex items-center justify-center shadow-lg mb-4">
        <span className="text-white text-3xl font-bold">W</span>
      </div>
      <p className="text-[#8E92A4] text-[14px] font-medium animate-pulse">
        Aggiunta in corso...
      </p>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-[#F8F9FB]">
        <div className="w-20 h-20 rounded-[24px] bg-[#E93D5D] flex items-center justify-center animate-pulse">
          <span className="text-white text-3xl font-bold">W</span>
        </div>
      </div>
    }>
      <ShareHandler />
    </Suspense>
  );
}
