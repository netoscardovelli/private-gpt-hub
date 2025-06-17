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

    if (action === 'sugestao-formulas') {
      const message = 'Quero sugestões de fórmulas personalizadas baseadas em caso clínico';

      addMessage({
        content: message,
        role: 'user'
      });

      setIsLoading(true);
      setConversationMode('analysis');

      setTimeout(() => {
        addMessage({
          content: `Olá! 🩺 Sou um assistente clínico altamente especializado em fórmulas manipuladas, voltado para profissionais da saúde como médicos, nutricionistas, farmacêuticos e biomédicos prescritores.

🎯 **Minha principal função é ajudar você a construir fórmulas manipuladas personalizadas do zero**, respeitando rigorosamente:

✅ As boas práticas de prescrição clínica
✅ As normas de farmacotécnica e farmacodinâmica  
✅ Os limites de dose mínima e máxima segundo Farmacopeia
✅ A viabilidade galênica e melhores condutas de manipulação
✅ A lógica clínica individualizada com base em sintomas e objetivos do paciente

Vou criar fórmulas cientificamente embasadas com base no seu caso clínico, podendo sugerir múltiplas fórmulas quando necessário (ex: uma para sono e outra para emagrecimento), incluindo ativos de marca quando apropriado (Morosil®, Metabolaid®, etc.).

**🧠 Para começarmos, você prefere:**

<quick-action>caso-clinico-completo</quick-action>

<quick-action>construir-passo-a-passo</quick-action>

Escolha a opção que preferir e vamos criar fórmulas personalizadas baseadas em evidências científicas sólidas e raciocínio clínico individualizado! 💊`,
          role: 'assistant'
        });
        setIsLoading(false);
      }, 1000);
      return;
    }

    if (action === 'caso-clinico-completo') {
      const message = 'Quero colar o caso clínico completo agora';

      addMessage({
        content: message,
        role: 'user'
      });

      setIsLoading(true);

      setTimeout(() => {
        addMessage({
          content: `Perfeito! 📋

Cole aqui seu caso clínico completo com todas as informações disponíveis. 

Vou extrair atentamente as seguintes informações do seu relato para construir as fórmulas ideais:

• **Dados do paciente:** idade, sexo
• **Objetivo(s) clínico(s):** principal(is) meta(s) do tratamento
• **Sintomas ou diagnóstico:** quadro atual detalhado
• **Medicamentos em uso:** se houver
• **Tempo de evolução:** há quanto tempo apresenta os sintomas
• **Sintomas associados:** queixas secundárias
• **Horário de piora:** quando os sintomas são mais intensos
• **Histórico de fórmulas:** tratamentos anteriores
• **Preferências:** número de fórmulas e forma farmacêutica desejada

Quanto mais detalhado o caso, mais precisa e personalizada será minha sugestão de fórmulas!

💡 **Cole seu caso clínico completo abaixo:**`,
          role: 'assistant'
        });
        setIsLoading(false);
      }, 1000);
      return;
    }

    if (action === 'construir-passo-a-passo') {
      const message = 'Quero construir o caso clínico passo a passo';

      addMessage({
        content: message,
        role: 'user'
      });

      setIsLoading(true);

      setTimeout(() => {
        addMessage({
          content: `Excelente escolha! 👩‍⚕️👨‍⚕️

Vamos construir o caso clínico juntos de forma inteligente para criar as melhores fórmulas para seu paciente.

**Primeira pergunta:**

**Qual é o nome do paciente?** 

(Importante para personalizar a prescrição e o futuro PDF)

*Farei as próximas perguntas de forma estratégica, uma por vez, baseado nas suas respostas*`,
          role: 'assistant'
        });
        setIsLoading(false);
      }, 1000);
      return;
    }

    if (action === 'suggest-improvements') {
      console.log('🧠 Processando sugestões de otimização...');
      
      // Buscar mensagens do assistente que contenham análises de fórmula
      const formulaMessages = messages
        .filter(msg => msg.role === 'assistant')
        .filter(msg => {
          const content = msg.content.toLowerCase();
          return content.includes('fórmula') && 
                 (content.includes('mg') || content.includes('mcg') || content.includes('ui') ||
                  content.includes('composição') || content.includes('análise'));
        });

      console.log('📋 Mensagens com fórmulas encontradas:', formulaMessages.length);

      if (formulaMessages.length === 0) {
        // Se não encontrar análises, sugere uma análise geral
        const message = `Com base no contexto da nossa conversa, forneça sugestões de ativos e fórmulas que podem ser úteis para complementar tratamentos farmacêuticos. 

Inclua:
- Ativos populares e suas indicações
- Combinações sinérgicas comuns
- Dosagens recomendadas
- Justificativas científicas

Seja específico e prático nas recomendações, mesmo sem uma fórmula específica para analisar.`;

        addMessage({
          content: 'Sugerir ativos e fórmulas complementares',
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
        return;
      }

      // Se encontrou fórmulas, usa a mais recente para sugestões específicas
      const lastFormulaMessage = formulaMessages[formulaMessages.length - 1];
      console.log('📄 Última análise encontrada:', lastFormulaMessage.content.substring(0, 200));

      const message = `Com base na fórmula analisada anteriormente, forneça sugestões específicas de otimização e ativos complementares.

ANÁLISE DE FÓRMULA IDENTIFICADA:
${lastFormulaMessage.content}

Forneça sugestões práticas para melhorar esta fórmula, incluindo:
- Ativos complementares que poderiam ser adicionados
- Ajustes de dosagem recomendados  
- Combinações sinérgicas
- Justificativas científicas para cada sugestão
- Como os novos ativos se integrariam com os existentes

Seja específico e prático nas recomendações.`;

      addMessage({
        content: 'Sugerir otimizações para a fórmula analisada',
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
    console.log('🔄 Processando adição de ativos:', actives);

    if (!actives || actives.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum ativo fornecido para adicionar.",
        variant: "destructive"
      });
      return;
    }

    const activeToAdd = actives[0]; // Pega o primeiro ativo
    console.log('📋 Ativo a ser adicionado:', activeToAdd);

    // Buscar a última mensagem do assistente que contenha análise de fórmula
    const lastAssistantMessage = messages
      .filter(msg => msg.role === 'assistant')
      .reverse()
      .find(msg => {
        const content = msg.content;
        return content.includes('**Composição') || 
               content.includes('**COMPOSIÇÃO') ||
               content.includes('📋 **FÓRMULAS PRESCRITAS:**') ||
               (content.includes('• ') && content.includes('mg'));
      });

    if (!lastAssistantMessage) {
      toast({
        title: "Erro",
        description: "Não foi possível encontrar uma análise de fórmula recente.",
        variant: "destructive"
      });
      return;
    }

    console.log('📄 Última análise encontrada para modificar');

    let enhancedMessage = '';

    if (activeToAdd.createNew) {
      // Criar nova fórmula
      enhancedMessage = `Criar uma nova fórmula incluindo o seguinte ativo:

**NOVO ATIVO PARA FÓRMULA:**
• ${activeToAdd.name} ${activeToAdd.concentration}

**INSTRUÇÕES:**
1. Crie uma nova fórmula magistral incluindo este ativo
2. Sugira outros ativos complementares que funcionem em sinergia
3. Defina dosagens adequadas para todos os componentes
4. Forneça análise completa da nova formulação
5. Explique os benefícios e mecanismos de ação
6. Inclua orientações de uso e precauções

Desenvolva uma fórmula completa e eficaz com base neste ativo principal.`;

      addMessage({
        content: `Criar nova fórmula com ${activeToAdd.name}`,
        role: 'user'
      });
    } else {
      // Adicionar à fórmula existente
      const formulaIndex = activeToAdd.formulaIndex || 0;
      
      enhancedMessage = `Com base na análise de fórmula anterior, ADICIONE o seguinte ativo e refaça a análise completa:

**FÓRMULA ORIGINAL:**
${lastAssistantMessage.content}

**ATIVO A INCLUIR:**
• ${activeToAdd.name} ${activeToAdd.concentration}

**INSTRUÇÕES ESPECÍFICAS:**
1. Adicione este ativo à fórmula ${formulaIndex >= 0 ? `número ${formulaIndex + 1}` : 'existente'}
2. Recalcule toda a composição considerando o novo ativo
3. Avalie possíveis interações e sinergias
4. Ajuste dosagens se necessário para manter eficácia e segurança
5. Forneça nova análise completa da fórmula modificada
6. Explique como o novo ativo potencializa os resultados
7. Mantenha o formato padrão de análise com composição atualizada

IMPORTANTE: Mostre a fórmula completa com o novo ativo integrado e explique os benefícios da combinação.`;

      addMessage({
        content: `Adicionar ${activeToAdd.name} à fórmula e reanalizar`,
        role: 'user'
      });
    }

    setIsLoading(true);

    try {
      const customActives = JSON.parse(localStorage.getItem('customActives') || '[]');
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      console.log('🚀 Enviando requisição para incluir ativo...');

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

      console.log('✅ Nova análise gerada com ativo incluído');

      addMessage({
        content: data.response,
        role: 'assistant'
      });

      toast({
        title: "Ativo incluído!",
        description: `${activeToAdd.name} foi adicionado e a fórmula foi reanalisada`,
      });

    } catch (error: any) {
      console.error('❌ Erro ao incluir ativo:', error);
      
      addMessage({
        content: `🚫 Ocorreu um erro ao incluir o ativo na fórmula. Tente novamente.\n\nErro: ${error.message}`,
        role: 'assistant'
      });

      toast({
        title: "Erro ao incluir ativo",
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
