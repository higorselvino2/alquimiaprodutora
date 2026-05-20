"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useLeadStore } from '@/store/useLeadStore';
import { Clock, MessageCircle, Check, BellRing } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

export default function AlertasPage() {
  const { leads, fetchLeads, isInitialized, updateLead } = useLeadStore();
  const [mounted, setMounted] = useState(false);
  const [lastLeadCount, setLastLeadCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!isInitialized) fetchLeads();
    
    // Create audio element for notification
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, [isInitialized, fetchLeads]);

  // Filter only new leads that need human attention
  const pendentes = leads.filter(l => l.status === 'Novo Lead' || l.status === 'aguardando_humano').sort((a, b) => {
    if (!a.time) return 1;
    if (!b.time) return -1;
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });

  // Play sound when a new lead arrives
  useEffect(() => {
    if (mounted && pendentes.length > lastLeadCount) {
      // Trying to play sound (may be blocked by browser if no user interaction yet)
      try {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.log('Autoplay prevented:', e));
        }
      } catch (e) {}
    }
    setLastLeadCount(pendentes.length);
  }, [pendentes.length, mounted, lastLeadCount]);

  if (!mounted) return null;

  const markAsAttended = async (phone: string) => {
    await updateLead(phone, { status: 'Em Atendimento' });
  };

  const getWhatsAppLink = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
            <BellRing className="w-6 h-6 text-cyan-400" />
            Alerta de Atendimentos
          </h1>
          <p className="text-sm text-slate-400">
            Painel em tempo real de clientes aguardando atendimento humano via n8n.
          </p>
        </div>
      </div>

      {pendentes.length === 0 ? (
        <div className="glass rounded-2xl p-12 flex flex-col items-center justify-center text-center border-dashed border-white/10">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 neon-glow border border-emerald-500/20">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-medium text-slate-100 mb-2">Tudo limpo!</h3>
          <p className="text-slate-400">Nenhum cliente aguardando atendimento no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendentes.map((lead) => (
            <div 
              key={lead.phone} 
              className="glass p-6 rounded-2xl flex flex-col shadow-[0_0_15px_rgba(34,211,238,0.1)] border-cyan-500/30 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 shadow-[0_0_10px_#22d3ee]"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold border border-cyan-500/20">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-lg leading-tight">{lead.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{lead.tipo_artista || 'Cliente'} {lead.estilo_musical ? `• ${lead.estilo_musical}` : ''}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1 text-sm">
                <div className="flex items-center text-slate-300">
                  <Clock className="w-4 h-4 mr-2 text-slate-500" />
                  Tempo de espera: <span className="font-medium text-amber-400 ml-1">
                    {lead.time ? formatDistanceToNow(parseISO(lead.time), { addSuffix: true, locale: ptBR }) : 'Desconhecido'}
                  </span>
                </div>
                {lead.notes && (
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-xs italic text-slate-400 leading-relaxed">
                    "{lead.notes}"
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-auto">
                <a 
                  href={getWhatsAppLink(lead.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 neon-glow"
                >
                  <MessageCircle className="w-4 h-4" />
                  Responder no Whats
                </a>
                
                <button 
                  onClick={() => markAsAttended(lead.phone)}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-2.5 rounded-lg text-xs transition-colors border border-white/10 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Marcar Atendido
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
