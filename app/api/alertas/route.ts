import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Aviso: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY está faltando.");
  }

  return createClient(
    supabaseUrl || "https://dummy.supabase.co", 
    supabaseServiceKey || "dummy-key"
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔥 ALERTA - Recebido do n8n:", body);

    // Aceita tanto nome/telefone quanto os mapeamentos originais
    const _name = body.name || body.nome;
    const _phone = body.phone || body.telefone;

    if (!_phone || !_name) {
      console.log("Faltam campos obrigatórios!");
      return NextResponse.json({ error: "Campos 'nome' e 'telefone' são obrigatórios." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    
    // Tentar adicionar no Supabase
    const { error } = await supabase.from("leads").insert([
      {
        phone: _phone,
        name: _name,
        email: body.email || null,
        estilo_musical: body.estilo_musical || null,
        tipo_artista: body.tipo_artista || null,
        status: body.status || "aguardando_humano",
        genero_musical: body.genero_musical || null,
        notes: body.notes || "Alerta n8n: aguardando_humano",
        time: body.data_hora || new Date().toISOString()
      }
    ]);

    if (error) {
      console.error("❌ Erro interno do Supabase (Alerta):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Alerta inserido com sucesso!");
    return NextResponse.json({ success: true, message: "Recebido e salvo com sucesso" }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Erro na API de Alertas:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
