"use client";

import React, { useEffect } from 'react';
import { useLeadStore } from '@/store/useLeadStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, UserPlus, CheckCircle2, Clock } from 'lucide-react';
import { format, parseISO, isToday } from 'date-fns';

export default function Dashboard() {
  const { leads, isLoading, isInitialized, fetchLeads, subscribeToLeads } = useLeadStore();

  useEffect(() => {
    if (!isInitialized) {
      fetchLeads();
    }
    subscribeToLeads();
  }, [isInitialized, fetchLeads, subscribeToLeads]);

  if (isLoading && !isInitialized) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'Novo Lead').length;
  const inProgress = leads.filter(l => l.status === 'Em Atendimento' || l.status === 'Aguardando').length;
  const finished = leads.filter(l => l.status === 'Finalizado').length;
  const leadsToday = leads.filter(l => {
    if (!l.time) return false;
    try { return isToday(parseISO(l.time)); } catch { return false; }
  }).length;

  // Chart data
  const statusData = [
    { name: 'Novo', value: newLeads, color: '#22d3ee' },
    { name: 'Atend.', value: inProgress, color: '#facc15' },
    { name: 'Fin.', value: finished, color: '#34d399' },
  ];

  const sortedLeads = [...leads].sort((a, b) => {
    if (!a.time) return 1;
    if (!b.time) return -1;
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });
  const recentLeads = sortedLeads.slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Dashboard</h1>
          <p className="text-sm text-gray-400">Visão geral dos seus leads de produção musical.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total de Leads" value={totalLeads} icon={Users} color="text-cyan-400" bg="bg-cyan-500/10" subtitle="Total histórico" />
        <StatCard title="Novos (24h)" value={leadsToday} icon={UserPlus} color="text-purple-400" bg="bg-purple-500/10" subtitle="Aguardando triagem IA" />
        <StatCard title="Em Atendimento" value={inProgress} icon={Clock} color="text-yellow-400" bg="bg-yellow-500/10" subtitle="Atendentes ativos agora" />
        <StatCard title="Finalizados" value={finished} icon={CheckCircle2} color="text-emerald-400" bg="bg-emerald-500/10" subtitle="Processo concluído" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <h2 className="text-sm font-semibold text-slate-100 mb-6 uppercase tracking-wider">Leads por Status</h2>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(13, 13, 15, 0.9)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col">
          <h2 className="text-sm font-semibold text-slate-100 mb-6 uppercase tracking-wider">Atividade Recente</h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {recentLeads.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Nenhuma atividade recente.</p>
            ) : (
              recentLeads.map(lead => (
                <div key={lead.phone} className="flex gap-4 group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400 font-bold border border-white/10 shrink-0">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-100">{lead.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{lead.estilo_musical || 'Sem estilo'} • {lead.status}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {lead.time ? format(parseISO(lead.time), "dd/MM HH:mm") : 'Sem data'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg, subtitle }: { title: string, value: number, icon: any, color: string, bg: string, subtitle?: string }) {
  return (
    <div className="glass p-5 rounded-2xl flex flex-col justify-between hover:border-cyan-500/30 transition-colors">
      <div className="flex justify-between items-start">
        <span className="text-slate-400 text-xs font-medium uppercase">{title}</span>
        <div className={`p-1.5 rounded-md ${bg} ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold mt-2 text-slate-100">{value}</p>
        {subtitle && <p className={`text-[10px] mt-1 ${color}`}>{subtitle}</p>}
      </div>
    </div>
  );
}
