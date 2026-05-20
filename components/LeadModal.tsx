"use client";

import React, { useState, useEffect } from 'react';
import { Lead } from '@/types';
import { X, Save, Trash2, User, Phone, Mail, Music, Info, FileText, Clock } from 'lucide-react';
import { useLeadStore } from '@/store/useLeadStore';
import { format, parseISO } from 'date-fns';
import { StatusBadge } from '@/components/StatusBadge';

interface LeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  isCreating: boolean;
}

export function LeadModal({ lead, isOpen, onClose, isCreating }: LeadModalProps) {
  const { updateLead, deleteLead, addLead } = useLeadStore();
  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '',
    phone: '',
    email: '',
    estilo_musical: '',
    tipo_artista: '',
    status: 'Novo Lead',
    genero_musical: '',
    notes: '',
  });
  const [isEditing, setIsEditing] = useState(isCreating);

  useEffect(() => {
    if (lead && !isCreating) {
      setFormData(lead);
      setIsEditing(false);
    } else if (isCreating) {
      setFormData({
        name: '',
        phone: '',
        email: '',
        estilo_musical: '',
        tipo_artista: '',
        status: 'Novo Lead',
        genero_musical: '',
        notes: '',
      });
      setIsEditing(true);
    }
  }, [lead, isCreating]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (isCreating) {
      const newLead: Lead = {
        phone: formData.phone as string,
        name: formData.name as string,
        email: formData.email || null,
        estilo_musical: formData.estilo_musical || null,
        tipo_artista: formData.tipo_artista || null,
        status: formData.status as string,
        time: new Date().toISOString(),
        genero_musical: formData.genero_musical || null,
        notes: formData.notes || null,
      };
      await addLead(newLead);
      onClose();
    } else if (lead) {
      await updateLead(lead.phone, formData);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (lead && window.confirm('Tem certeza que deseja remover este lead?')) {
      await deleteLead(lead.phone);
      onClose();
    }
  };

  const changeStatus = async (newStatus: string) => {
    if (lead) {
      await updateLead(lead.phone, { status: newStatus });
      setFormData(prev => ({ ...prev, status: newStatus }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end sm:p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-[#0A0A0B]/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md glass sm:rounded-2xl shadow-2xl flex flex-col slide-in-from-right-4 sm:slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex flex-shrink-0 items-center justify-center text-cyan-400 font-bold border border-cyan-500/20">
              {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 leading-tight">
                {isCreating ? 'Novo Lead' : formData.name}
              </h2>
              {!isCreating && <p className="text-xs text-slate-500 mt-0.5">{formData.phone}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white rounded-full hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!isCreating && !isEditing && lead && (
            <div className="flex gap-2 flex-wrap mb-4">
              <StatusBadge status={formData.status || ''} />
              {formData.time && (
                <span className="px-2.5 py-1 text-[10px] uppercase font-medium tracking-widest rounded-full border border-white/10 bg-white/5 text-slate-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {format(parseISO(formData.time), "dd/MM/yyyy HH:mm")}
                </span>
              )}
            </div>
          )}

          {/* Quick Actions (View Mode) */}
          {!isEditing && !isCreating && lead && (
            <div className="grid grid-cols-2 gap-2 pb-4 border-b border-white/5">
              {formData.status === 'Novo Lead' || formData.status === 'Aguardando' ? (
                <button 
                  onClick={() => changeStatus('Em Atendimento')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Music className="w-3.5 h-3.5" /> Assumir
                </button>
              ) : (
                <button 
                  onClick={() => changeStatus('Finalizado')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2 rounded-lg text-xs transition-colors"
                >
                  Finalizar
                </button>
              )}
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-2 rounded-lg text-xs transition-colors border border-white/10"
              >
                Editar Dados
              </button>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center">
                <User className="w-3.5 h-3.5 mr-2" /> Contato
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name || ''} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50 disabled:opacity-70 disabled:bg-transparent transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">WhatsApp / Telefone</label>
                  <input 
                    type="text" 
                    name="phone"
                    value={formData.phone || ''} 
                    onChange={handleChange}
                    disabled={!isCreating}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50 disabled:opacity-70 disabled:bg-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email || ''} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50 disabled:opacity-70 disabled:bg-transparent transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center">
                <Music className="w-3.5 h-3.5 mr-2" /> Perfil Artístico
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tipo de Artista</label>
                  <input 
                    type="text" 
                    name="tipo_artista"
                    value={formData.tipo_artista || ''} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Ex: Solo, Banda"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50 disabled:opacity-70 disabled:bg-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Gênero Musical</label>
                  <input 
                    type="text" 
                    name="estilo_musical" // maps to estilo_musical or genero_musical depending on user logic
                    value={formData.estilo_musical || ''} 
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Ex: Trap, Funk..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50 disabled:opacity-70 disabled:bg-transparent transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center">
                <Info className="w-3.5 h-3.5 mr-2" /> Status Operacional
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                <select 
                  name="status"
                  value={formData.status || ''} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50 disabled:opacity-70 disabled:bg-transparent appearance-none transition-colors"
                >
                  <option className="bg-[#0A0A0B]" value="Novo Lead">Novo Lead</option>
                  <option className="bg-[#0A0A0B]" value="Aguardando">Aguardando</option>
                  <option className="bg-[#0A0A0B]" value="Em Atendimento">Em Atendimento</option>
                  <option className="bg-[#0A0A0B]" value="Finalizado">Finalizado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Observações IA / Histórico</label>
                <textarea 
                  name="notes"
                  value={formData.notes || ''} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs italic text-slate-300 focus:outline-none focus:border-cyan-500/50 disabled:opacity-70 disabled:bg-white/5 transition-colors resize-none leading-relaxed"
                  placeholder="Adicione notas de atendimento aqui..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {isEditing && (
          <div className="p-4 sm:p-6 border-t border-white/5 sm:rounded-b-2xl flex justify-between gap-3 bg-white/[0.02]">
            {!isCreating ? (
              <button 
                onClick={handleDelete}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                title="Deletar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <div /> // Spacer
            )}
            
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  if (isCreating) onClose();
                  else setIsEditing(false);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 text-xs font-bold text-black bg-cyan-500 hover:bg-cyan-400 rounded-lg transition-colors flex items-center neon-glow"
              >
                <Save className="w-3.5 h-3.5 mr-2" />
                Salvar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
