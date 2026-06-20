import { createClient } from "https://esm.sh/@supabase/supabase-js@2.106.2";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Create demo fan user
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: "fan@sporena.com",
      password: "demo123",
      email_confirm: true,
    });

    if (userError && !userError.message.includes("already been registered")) {
      return new Response(JSON.stringify({ error: userError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData?.user?.id;

    if (userId) {
      // 2. Create fan profile
      await supabase.from("fan_profiles").upsert({
        user_id: userId,
        pseudo: "SportifLyon",
        favorite_sport: "Football",
        sport_score: 2480,
        member_since: new Date().toISOString(),
      }, { onConflict: "user_id" });

      // 3. Create fan settings
      await supabase.from("fan_settings").upsert({
        user_id: userId,
        email_notif: true,
        push_notif: true,
        sms_notif: false,
      }, { onConflict: "user_id" });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Demo user seeded", userId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
