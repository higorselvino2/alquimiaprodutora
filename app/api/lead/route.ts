import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient, supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validação básica do corpo
    if (!body.phone || !body.name) {
      return NextResponse.json({ error: "Campos 'phone' e 'name' são obrigatórios." }, { status: 400 });
    }

    // Preparando o payload com base no DB schema
    const newLead = {
      phone: body.phone,
      name: body.name,
      email: body.email || null,
      estilo_musical: body.estilo_musical || null,
      tipo_artista: body.tipo_artista || null,
      status: body.status || "Novo Lead",
      genero_musical: body.genero_musical || null,
      notes: body.notes || null,
      time: new Date().toISOString()
    };

    // Tentar usar o Service Role se existir, para bypassar possiveis RLS (row level security)
    let client = supabase;
    try {
      client = getServiceRoleClient();
    } catch {
      // Fallback pra anon se a service key não estiver presente
      client = supabase;
    }

    // Inserir no Supabase (se a key já existir, pode falhar ou fazer upsert, faremos upsert para garantir)
    const { data, error } = await client
      .from('leads')
      .upsert(newLead, { onConflict: 'phone' })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, lead: data }, { status: 201 });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
