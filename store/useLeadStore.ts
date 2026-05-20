import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Lead } from '@/types';
import toast from 'react-hot-toast';

interface LeadStore {
  leads: Lead[];
  isLoading: boolean;
  isInitialized: boolean;
  fetchLeads: () => Promise<void>;
  updateLead: (phone: string, data: Partial<Lead>) => Promise<void>;
  deleteLead: (phone: string) => Promise<void>;
  addLead: (lead: Lead) => Promise<void>;
  subscribeToLeads: () => void;
  unsubscribeFromLeads: () => void;
}

let realtimeChannel: any = null;

const mockLeads: Lead[] = [
  { phone: '5511975976122', name: 'Higor Martins', email: 'higor@prod.com', estilo_musical: 'Trap / Grime', tipo_artista: 'Solo', status: 'Novo Lead', genero_musical: 'Trap', notes: 'O cliente solicitou atendimento humano para discutir pacotes de mixagem para álbum de 12 faixas.', time: new Date().toISOString() },
  { phone: '5511999999999', name: 'Lucas Soul', email: 'lucas@email.com', estilo_musical: 'R&B / Pop', tipo_artista: 'Banda', status: 'Em Atendimento', genero_musical: 'R&B', notes: 'Gravação de voz marcada para sexta', time: new Date(Date.now() - 3600000).toISOString() },
  { phone: '5521988221010', name: 'Ana Lo-Fi', email: 'ana@email.com', estilo_musical: 'Instrumental', tipo_artista: 'Produtor', status: 'Finalizado', genero_musical: 'Lo-Fi', notes: 'Entrega do beat finalizada com sucesso', time: new Date(Date.now() - 86400000).toISOString() },
];

export const useLeadStore = create<LeadStore>((set, get) => ({
  leads: [],
  isLoading: true,
  isInitialized: false,

  fetchLeads: async () => {
    set({ isLoading: true });
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://dummy.supabase.co' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('time', { ascending: false });

      if (error) throw error;
      set({ leads: data as Lead[], isLoading: false, isInitialized: true });
    } catch (error: any) {
      console.error('Error fetching leads:', error);
      toast.error('Supabase não configurado. Mostrando dados de demonstração.');
      set({ leads: mockLeads, isLoading: false, isInitialized: true });
    }
  },

  updateLead: async (phone: string, data: Partial<Lead>) => {
    try {
      // Optimistic update
      set((state) => ({
        leads: state.leads.map((l) => (l.phone === phone ? { ...l, ...data } : l)),
      }));

      if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://dummy.supabase.co' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        toast.success('Lead simulado atualizado (Supabase não configurado)');
        return;
      }

      const { error } = await supabase
        .from('leads')
        .update(data)
        .eq('phone', phone);

      if (error) throw error;
      toast.success('Lead atualizado com sucesso');
    } catch (error: any) {
      console.error('Error updating lead:', error);
      toast.error('Erro ao atualizar lead');
      // Option: revert optimistic update if failed
    }
  },

  deleteLead: async (phone: string) => {
    try {
      set((state) => ({
        leads: state.leads.filter((l) => l.phone !== phone),
      }));

      if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://dummy.supabase.co' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        toast.success('Lead simulado removido (Supabase não configurado)');
        return;
      }

      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('phone', phone);

      if (error) throw error;
      toast.success('Lead removido com sucesso');
    } catch (error: any) {
      console.error('Error deleting lead:', error);
      toast.error('Erro ao remover lead');
    }
  },

  addLead: async (lead: Lead) => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://dummy.supabase.co' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        set((state) => ({ leads: [lead, ...state.leads] }));
        toast.success('Lead simulado adicionado (Supabase não configurado)');
        return;
      }

      const { error } = await supabase
        .from('leads')
        .insert([lead]);

      if (error) throw error;
      set((state) => ({ leads: [lead, ...state.leads] }));
      toast.success('Lead adicionado com sucesso');
    } catch (error: any) {
      console.error('Error adding lead:', error);
      toast.error('Erro ao adicionar lead');
    }
  },

  subscribeToLeads: () => {
    if (realtimeChannel) return;
    if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://dummy.supabase.co' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return;
    }

    realtimeChannel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          
          set((state) => {
            let updatedLeads = [...state.leads];
            
            if (eventType === 'INSERT') {
              updatedLeads = [newRecord as Lead, ...updatedLeads];
              toast.success(`Novo lead recebido: ${(newRecord as Lead).name}`);
            } else if (eventType === 'UPDATE') {
              updatedLeads = updatedLeads.map((l) =>
                l.phone === (newRecord as Lead).phone ? (newRecord as Lead) : l
              );
            } else if (eventType === 'DELETE') {
              updatedLeads = updatedLeads.filter((l) => l.phone !== (oldRecord as Lead).phone);
            }

            return { leads: updatedLeads };
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime mode active');
        }
      });
  },

  unsubscribeFromLeads: () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
  }
}));
