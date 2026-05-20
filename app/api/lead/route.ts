import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Instanciando o cliente usando a chave Service Role (ignorando RLS)
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Aviso: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY está faltando.");
  }

  // Fazemos um fallback com "https://dummy.supabase.co" caso não esteja configurado
  // para evitar que o Build/NextJS crashe durante execução sem os .env setados
  return createClient(
    supabaseUrl || "https://dummy.supabase.co", 
    supabaseServiceKey || "dummy-key"
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔥 Recebido do n8n no backend:", body);

    // Validação mínima
    if (!body.phone || !body.name) {
      console.log("Faltam campos obrigatórios!");
      return NextResponse.json({ error: "Campos 'phone' e 'name' são obrigatórios." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    
    // Tentar adicionar no Supabase
    const { error } = await supabase.from("leads").insert([
      {
        phone: body.phone,
        name: body.name,
        email: body.email || null,
        estilo_musical: body.estilo_musical || null,
        tipo_artista: body.tipo_artista || null,
        status: body.status || "Novo Lead",
        genero_musical: body.genero_musical || null,
        notes: body.notes || "Cliente pediu atendimento humano", // Usando fallback das notes
        time: new Date().toISOString()
      }
    ]);

    if (error) {
      console.error("❌ Erro interno do Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Lead inserido com sucesso!");
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Erro ao processar webhook:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}

