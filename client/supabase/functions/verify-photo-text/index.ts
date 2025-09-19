// supabase/functions/verify-photo-text/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req: Request) => {
  try {
    const { imageUrl, text } = await req.json();
console.log("Received request with:", { imageUrl, text });
    // ✅ Validate input
    if (!imageUrl || !text) {
      return new Response(
        JSON.stringify({ error: "imageUrl and text are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 📥 Fetch image from URL
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch image from URL", status: imgRes.status }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const imgBuffer = new Uint8Array(await imgRes.arrayBuffer());

    // ⚠️ Check for tiny/broken image
    if (imgBuffer.length < 1000) {
      return new Response(
        JSON.stringify({ error: "Image seems invalid or corrupted" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🔧 Convert to base64
    const imgBase64 = btoa(String.fromCharCode(...imgBuffer));

    // 🔥 Call Gemini 2.5 Flash
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are a strict validator. Answer ONLY "true" or "false". 
                         Does this image match the description: "${text}"?`
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: imgBase64,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const geminiData = await geminiRes.json();

    // ⚡ Extract Gemini output
    const rawOutput =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "false";

    // 🛠 Normalize Gemini response to boolean (strict)
    const normalized = rawOutput.toLowerCase();
    let related: boolean;
    if (normalized === "true") related = true;
    else if (normalized === "false") related = false;
    else {
      related = false; // unexpected output treated as false
      console.warn("Unexpected Gemini output:", rawOutput);
    }

    return new Response(
      JSON.stringify({ related, raw: rawOutput }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Server error", detail: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
