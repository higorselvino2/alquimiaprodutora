import React from 'react';

export function StatusBadge({ status }: { status: string }) {
  let colorClass = 'bg-slate-800 text-slate-400 border-white/10';
  
  switch(status) {
    case 'Novo Lead':
      colorClass = 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      break;
    case 'Aguardando':
      colorClass = 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      break;
    case 'Em Atendimento':
      colorClass = 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      break;
    case 'Finalizado':
      colorClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      break;
  }

  return (
    <span className={`status-badge border ${colorClass}`}>
      {status}
    </span>
  );
}
