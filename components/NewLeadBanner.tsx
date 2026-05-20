"use client";

import React, { useEffect, useState } from 'react';
import { useLeadStore } from '@/store/useLeadStore';
import { PhoneCall } from 'lucide-react';
import Link from 'next/link';

export function NewLeadBanner() {
  const { leads, isInitialized, fetchLeads, subscribeToLeads } = useLeadStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isInitialized) fetchLeads();
    subscribeToLeads();
  }, [isInitialized, fetchLeads, subscribeToLeads]);

  if (!mounted) return null;

  const newLeads = leads.filter(l => l.status === 'Novo Lead').sort((a,b) => {
    if (!a.time) return 1;
    if (!b.time) return -1;
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });

  if (newLeads.length === 0) return null;

  const latestLead = newLeads[0];

  return (
    <div className="bg-cyan-500/10 border-b border-cyan-500/20 px-4 py-3 flex items-center justify-between text-xs sm:text-sm shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
       <div className="flex items-center gap-3 text-cyan-400">
          <div className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </div>
          <span className="flex-1">
            <strong className="text-cyan-300">{newLeads.length}</strong> {newLeads.length === 1 ? 'cliente novo aguardando' : 'clientes novos aguardando'} contato. 
            <span className="hidden sm:inline text-slate-300 ml-1">
              &mdash; Último chamado: <span className="font-medium text-white">{latestLead.name}</span> <strong>({latestLead.phone})</strong>
            </span>
            <span className="sm:hidden text-slate-300 ml-1 font-medium">
              &mdash; {latestLead.phone}
            </span>
          </span>
       </div>
       <Link href="/leads" className="bg-cyan-500 hover:bg-cyan-400 text-black px-3 py-1.5 rounded text-xs font-bold transition-all neon-glow flex items-center gap-1.5 shrink-0 ml-2">
         <PhoneCall className="w-3.5 h-3.5" />
         <span>Responder</span>
       </Link>
    </div>
  );
}
