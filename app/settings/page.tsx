"use client";

import React from 'react';
import { Settings2, Database, Key } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white mb-1">Configurações</h1>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Gerencie integrações do sistema</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden shadow-sm hover:border-cyan-500/30 transition-colors">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <Database className="w-5 h-5 text-purple-400" />
          <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">Integração Supabase</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-400">
            O sistema utiliza o Supabase como banco de dados em tempo real.
            Para que o aplicativo funcione, você deve configurar as variáveis de ambiente no painel de Segredos (Secrets).
          </p>
          <div className="bg-black/40 p-4 rounded-lg border border-white/5 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
            <div>NEXT_PUBLIC_SUPABASE_URL=...</div>
            <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=...</div>
            <div>SUPABASE_SERVICE_ROLE_KEY=... (opcional para API)</div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden shadow-sm hover:border-cyan-500/30 transition-colors">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <Key className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">Webhook n8n</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-400">
            Para receber leads vindos do WhatsApp (via n8n), você deve configurar o endpoint HTTP no seu workflow do n8n (HTTP Request Node) como método POST.
          </p>
          <div className="bg-black/40 p-4 rounded-lg border border-white/5 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre">
            {`POST /api/lead

{
  "name": "Nome do Cliente",
  "phone": "5511999999999",
  "email": "cliente@email.com",
  "estilo_musical": "Trap",
  "tipo_artista": "Solo",
  "notes": "Veio pelo Instagram"
}`}
          </div>
        </div>
      </div>
    </div>
  );
}
