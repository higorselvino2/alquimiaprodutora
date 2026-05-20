"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useLeadStore } from '@/store/useLeadStore';
import { Lead } from '@/types';
import { Search, Filter, Plus, Phone, Mail, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { LeadModal } from '@/components/LeadModal';
import { StatusBadge } from '@/components/StatusBadge';

export default function LeadsPage() {
  const { leads, fetchLeads, isInitialized } = useLeadStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isInitialized) fetchLeads();
  }, [isInitialized, fetchLeads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) || 
                            lead.phone.includes(search);
      const matchesStatus = statusFilter === 'Todos' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        if (!a.time) return 1;
        if (!b.time) return -1;
        return new Date(b.time).getTime() - new Date(a.time).getTime();
    });
  }, [leads, search, statusFilter]);

  const openLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsCreating(false);
    setIsModalOpen(true);
  };

  const createNewLead = () => {
    setSelectedLead(null);
    setIsCreating(true);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white mb-1">Relatório de Leads</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Sincronizado com Supabase Realtime</p>
        </div>
        <button 
          onClick={createNewLead}
          className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 neon-glow"
        >
          <Plus className="w-4 h-4" />
          Novo Lead
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg leading-5 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 sm:text-sm transition-colors"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            className="bg-white/5 border border-white/10 text-slate-200 text-sm rounded-lg focus:border-cyan-500/50 block w-full py-2 px-3 focus:outline-none transition-colors"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Todos">Todos os Status</option>
            <option value="Novo Lead">Novo Lead</option>
            <option value="Aguardando">Aguardando</option>
            <option value="Em Atendimento">Em Atendimento</option>
            <option value="Finalizado">Finalizado</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block glass rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto overflow-y-auto h-full w-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-slate-400 font-semibold sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4">Lead / Artista</th>
                <th className="px-6 py-4">Gênero</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.map((lead) => (
                <tr 
                  key={lead.phone} 
                  onClick={() => openLead(lead)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded shrink-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs border border-cyan-500/20">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-100">{lead.name}</div>
                        <div className="text-xs text-slate-500">{lead.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-[11px] bg-slate-800 px-2 py-1 flex flex-col items-start gap-1 w-max rounded border border-white/10 text-slate-300">
                      <span>{lead.estilo_musical || 'N/A'}</span>
                      {lead.tipo_artista && <span className="text-[10px] text-slate-500">{lead.tipo_artista}</span>}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                    {lead.time ? format(parseISO(lead.time), "dd/MM/yyyy HH:mm") : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLeads.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">Nenhum lead encontrado.</div>
          )}
        </div>
      </div>

      {/* Mobile & Tablet Cards */}
      <div className="block lg:hidden space-y-4 pb-10">
        {filteredLeads.map((lead) => (
          <div 
            key={lead.phone} 
            onClick={() => openLead(lead)}
            className="glass p-4 rounded-2xl hover:border-cyan-500/30 transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400 font-bold border border-cyan-500/20">
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-slate-100 text-sm">{lead.name}</h3>
                  <StatusBadge status={lead.status} />
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mt-4 text-xs">
              <div className="flex items-center text-slate-400">
                <Phone className="w-3.5 h-3.5 mr-2" />
                {lead.phone}
              </div>
              {lead.email && (
                <div className="flex items-center text-slate-400">
                  <Mail className="w-3.5 h-3.5 mr-2" />
                  {lead.email}
                </div>
              )}
              <div className="flex items-center text-slate-400">
                <Clock className="w-3.5 h-3.5 mr-2" />
                {lead.time ? format(parseISO(lead.time), "dd/MM/yyyy HH:mm") : '-'}
              </div>
            </div>
          </div>
        ))}
        {filteredLeads.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">Nenhum lead encontrado.</div>
        )}
      </div>

      {isModalOpen && (
        <LeadModal 
          lead={selectedLead} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          isCreating={isCreating}
        />
      )}
    </div>
  );
}
