import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      console.warn("BREVO_API_KEY not set — skipping contact creation");
      return new Response(
        JSON.stringify({ success: false, reason: "BREVO_API_KEY not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const { email, name, listIds } = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    const body: Record<string, unknown> = {
      email,
      updateEnabled: true,
    };

    if (name) {
      body.attributes = { FIRSTNAME: name };
    }

    if (listIds && Array.isArray(listIds) && listIds.length > 0) {
      body.listIds = listIds;
    }

    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Brevo API error:", response.status, errorData);
      // Return success anyway — Brevo failures should not block user flow
      return new Response(
        JSON.stringify({ success: false, reason: `Brevo error: ${response.status}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in brevo-add-contact:", error);
    // Non-blocking: always return 200 so the calling flow doesn't break
    return new Response(
      JSON.stringify({ success: false, reason: error.message || "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
