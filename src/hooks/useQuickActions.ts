
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface UseQuickActionsProps {
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Message;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setConversationMode: (mode: 'initial' | 'analysis') => void;
  setIsLoading: (loading: boolean) => void;
  extractFormulasFromConversation: (messages: Message[]) => string;
  user: { id: string; name: string; plan: string; dailyLimit: number; usageToday: number };
  selectedSpecialty: string;
}

export const useQuickActions = ({
  messages,
  addMessage,
  setMessages,
  setConversationMode,
  setIsLoading,
  extractFormulasFromConversation,
  user,
  selectedSpecialty
}: UseQuickActionsProps) => {
  const { toast } = useToast();

  const handleQuickAction = async (action: string) => {
    console.log('🎯 Quick action triggered:', action);

    if (action === 'analise') {
      const message = 'Quero fazer análise de fórmulas magistrais';

      addMessage({
        content: message,
        role: 'user'
      });

      setIsLoading(true);
      setConversationMode('analysis');

      setTimeout(() => {
        addMessage({
          content: 'Perfeito! Cole suas fórmulas aqui e eu farei uma análise completa, incluindo:\n\n• Compatibilidade entre ativos\n• Concentrações adequadas\n• Possíveis incompatibilidades\n• Sugestões de melhorias\n• Observações técnicas importantes\n\nCole sua fórmula e vamos começar!',
          role: 'assistant'
        });
        setIsLoading(false);
      }, 1000);
      return;
    }

    if (action === 'suggest-improvements') {
      console.log('🧠 Processando sugestões de otimização...');
      
      const extractedFormulas = extractFormulasFromConversation(messages);
      console.log('📋 Fórmulas extraídas:', extractedFormulas);
      
      if (!extractedFormulas) {
        toast({
          title: "Nenhuma fórmula encontrada",
          description: "Primeiro analise uma fórmula para poder receber sugestões de otimização.",
          variant: "destructive"
        });
        return;
      }

      const message = `Com base nas fórmulas analisadas na conversa, forneça sugestões específicas de otimização.

FÓRMULAS IDENTIFICADAS:
${extractedFormulas}

Forneça sugestões práticas para melhorar essas fórmulas, incluindo:
- Ativos complementares que poderiam ser adicionados
- Ajustes de dosagem recomendados  
- Combinações sinérgicas
- Justificativas científicas para cada sugestão

Seja específico e prático nas recomendações.`;

      addMessage({
        content: 'Sugerir otimizações para as fórmulas analisadas',
        role: 'user'
      });

      setIsLoading(true);

      try {
        const customActives = JSON.parse(localStorage.getItem('customActives') || '[]');
        const conversationHistory = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        const { data, error } = await supabase.functions.invoke('chat-ai', {
          body: {
            message,
            conversationHistory,
            customActives,
            userId: user.id,
            specialty: selectedSpecialty
          }
        });

        if (error || data?.error || !data?.response) {
          throw new Error(data?.details || error?.message || 'Erro desconhecido');
        }

        addMessage({
          content: data.response,
          role: 'assistant'
        });
      } catch (error: any) {
        console.error('❌ Erro ao gerar sugestões:', error);
        addMessage({
          content: `🚫 Ocorreu um erro ao gerar sugestões. Tente novamente.\n\nErro: ${error.message}`,
          role: 'assistant'
        });

        toast({
          title: "Erro ao gerar sugestões",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddActiveToFormula = async (actives: any[]) => {
    const lastAssistantMessage = messages
      .filter(msg => msg.role === 'assistant')
      .reverse()
      .find(msg => msg.content.includes('• ') && msg.content.includes('mg'));

    if (!lastAssistantMessage) {
      toast({
        title: "Erro",
        description: "Não foi possível encontrar uma análise de fórmula recente.",
        variant: "destructive"
      });
      return;
    }

    const activesText = actives.map(active => 
      `- ${active.name} ${active.concentration}\n  Benefício: ${active.benefit}\n  Mecanismo: ${active.mechanism}`
    ).join('\n\n');

    const enhancedMessage = `Com base na análise anterior, inclua os seguintes ativos nas fórmulas e refaça a análise completa:

FÓRMULA ORIGINAL:
${lastAssistantMessage.content}

ATIVOS A INCLUIR:
${activesText}

INSTRUÇÃO: Refaça a análise das fórmulas incluindo estes novos ativos, mostrando como eles se integram com os demais componentes e potencializam os resultados. Para cada ativo, adicione-o especificamente à fórmula mencionada em sua sugestão. Use o formato padrão de análise com composição atualizada e nova explicação.`;

    addMessage({
      content: `Incluir ${actives.length} ativo(s) nas fórmulas e reanalizar`,
      role: 'user'
    });

    setIsLoading(true);

    try {
      const customActives = JSON.parse(localStorage.getItem('customActives') || '[]');
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: enhancedMessage,
          conversationHistory,
          customActives,
          userId: user.id,
          specialty: selectedSpecialty
        }
      });

      if (error || data?.error || !data?.response) {
        throw new Error(data?.details || error?.message || 'Erro desconhecido');
      }

      addMessage({
        content: data.response,
        role: 'assistant'
      });
    } catch (error: any) {
      addMessage({
        content: `🚫 Ocorreu um erro ao incluir os ativos nas fórmulas. Tente novamente.\n\nErro: ${error.message}`,
        role: 'assistant'
      });

      toast({
        title: "Erro ao incluir ativos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleQuickAction,
    handleAddActiveToFormula
  };
};
