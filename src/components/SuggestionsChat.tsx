import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, Loader2, ArrowLeft, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface SuggestionsChatProps {
  user: { name: string; plan: string };
  onBack: () => void;
}

interface ClinicalData {
  complaint: string;
  ageGender: string;
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  lifestyle: string;
  objectives: string;
}

const SuggestionsChat = ({ user, onBack }: SuggestionsChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Olá Dr(a). ${user.name}! 👨‍⚕️

Sou seu assistente para desenvolvimento de fórmulas magistrais personalizadas. Para criar a formulação mais adequada, preciso coletar informações clínicas do seu paciente através de uma anamnese estruturada.

São 7 perguntas essenciais que vou fazer sequencialmente:

**Pergunta 1 de 7:**
**Qual é a queixa principal do paciente?**
(Ex: acne inflamatória, melasma, queda capilar, ressecamento cutâneo, envelhecimento precoce, etc.)

Por favor, descreva detalhadamente a condição que precisa ser tratada.`,
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [clinicalData, setClinicalData] = useState<Partial<ClinicalData>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const clinicalQuestions = [
    {
      step: 1,
      question: "**Pergunta 1 de 7:**\n**Qual é a queixa principal do paciente?**\n(Ex: acne inflamatória, melasma, queda capilar, ressecamento cutâneo, envelhecimento precoce, etc.)\n\nPor favor, descreva detalhadamente a condição que precisa ser tratada.",
      field: 'complaint' as keyof ClinicalData
    },
    {
      step: 2,
      question: "**Pergunta 2 de 7:**\n**Idade e sexo do paciente?**\n(Ex: 28 anos, feminino / 45 anos, masculino)\n\nEssa informação é essencial para adequar a formulação ao perfil hormonal e metabólico.",
      field: 'ageGender' as keyof ClinicalData
    },
    {
      step: 3,
      question: "**Pergunta 3 de 7:**\n**Histórico médico relevante?**\n(Comorbidades, doenças crônicas, cirurgias prévias, condições dermatológicas, distúrbios hormonais, etc.)\n\nInclua qualquer condição médica que possa influenciar na escolha dos ativos.",
      field: 'medicalHistory' as keyof ClinicalData
    },
    {
      step: 4,
      question: "**Pergunta 4 de 7:**\n**Medicações em uso atualmente?**\n(Medicamentos prescritos, anticoncepcionais, suplementos, fitoterápicos, tratamentos tópicos, etc.)\n\nÉ fundamental conhecer possíveis interações medicamentosas.",
      field: 'currentMedications' as keyof ClinicalData
    },
    {
      step: 5,
      question: "**Pergunta 5 de 7:**\n**Alergias ou intolerâncias conhecidas?**\n(Medicamentosas, cosméticas, alimentares, contato, etc.)\n\nEspecifique se há reações conhecidas a ativos específicos ou grupos de substâncias.",
      field: 'allergies' as keyof ClinicalData
    },
    {
      step: 6,
      question: "**Pergunta 6 de 7:**\n**Estilo de vida do paciente?**\n(Rotina de cuidados, exposição solar, atividade física, níveis de estresse, qualidade do sono, hábitos alimentares)\n\nEssas informações ajudam a personalizar o tratamento.",
      field: 'lifestyle' as keyof ClinicalData
    },
    {
      step: 7,
      question: "**Pergunta 7 de 7:**\n**Objetivos terapêuticos específicos?**\n(Resultados esperados, prazo desejado, prioridades do tratamento)\n\nDefina as expectativas e metas do tratamento para direcionar a formulação.",
      field: 'objectives' as keyof ClinicalData
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateFormulationSuggestion = (data: ClinicalData) => {
    const responses = [
      `**🎯 ANÁLISE CLÍNICA COMPLETA - FORMULAÇÃO PERSONALIZADA**

**📋 PERFIL DO PACIENTE:**
• **Idade/Sexo:** ${data.ageGender}
• **Queixa Principal:** ${data.complaint}
• **Histórico Médico:** ${data.medicalHistory}
• **Medicações Atuais:** ${data.currentMedications}
• **Alergias:** ${data.allergies}
• **Estilo de Vida:** ${data.lifestyle}
• **Objetivos:** ${data.objectives}

---

**💊 PROTOCOLO FARMACÊUTICO PERSONALIZADO**

**🔬 FÓRMULA MAGISTRAL PRINCIPAL:**
*Baseada na análise clínica completa*

**Composição Sugerida:**
• Ativo Principal: [Específico para ${data.complaint}]
• Ativo Sinérgico: [Complementar ao perfil]
• Sistema de Liberação: [Adequado ao caso]
• Veículo: [Otimizado para o paciente]

**📊 FÓRMULAS COMPLEMENTARES:**
1. **Suporte Sistêmico:** Nutrientes específicos
2. **Proteção Antioxidante:** Moduladores personalizados
3. **Regulação Hormonal:** Se indicado pelo perfil

**⚠️ CONSIDERAÇÕES CRÍTICAS:**
• **Interações:** Avaliadas com ${data.currentMedications}
• **Contraindicações:** Respeitando ${data.allergies}
• **Monitoramento:** Protocolo personalizado
• **Ajustes:** Conforme resposta individual

**📅 CRONOGRAMA TERAPÊUTICO:**
• Fase 1: Introdução gradual (primeiras 2 semanas)
• Fase 2: Titulação da dose (semanas 3-6)
• Fase 3: Manutenção otimizada (após 6 semanas)

**🎯 RESULTADOS ESPERADOS:**
Baseado no objetivo: "${data.objectives}"

---
**Deseja que eu detalhe alguma formulação específica ou ajuste o protocolo?**`,

      `**📋 RELATÓRIO FARMACÊUTICO PERSONALIZADO**

**DADOS CLÍNICOS COLETADOS:**
• Paciente: ${data.ageGender}
• Indicação: ${data.complaint}
• Perfil Médico: ${data.medicalHistory}
• Terapias Atuais: ${data.currentMedications}
• Restrições: ${data.allergies}
• Contexto: ${data.lifestyle}
• Meta: ${data.objectives}

---

**🧬 ESTRATÉGIA TERAPÊUTICA INTEGRADA**

**FORMULAÇÃO PRIMÁRIA:**
*Desenvolvida especificamente para este perfil clínico*

**Princípios Ativos Selecionados:**
1. **Ativo Primário:** [Direcionado à queixa principal]
2. **Moduladores:** [Ajustados ao perfil hormonal/metabólico]
3. **Sinergistas:** [Potencializadores da ação principal]
4. **Protetores:** [Minimizando efeitos adversos]

**FORMULAÇÕES ADJUVANTES:**
• **Sistêmica:** Suporte nutricional direcionado
• **Tópica Complementar:** Cuidados específicos
• **Preventiva:** Proteção e manutenção

**🔍 ANÁLISE DE SEGURANÇA:**
• **Perfil de Interações:** Compatível com ${data.currentMedications}
• **Perfil Alergênico:** Evitando ${data.allergies}
• **Perfil Fisiológico:** Adequado ao histórico ${data.medicalHistory}

**📈 PROGNÓSTICO:**
Expectativa baseada em: ${data.objectives}

**Qual aspecto da formulação gostaria que eu aprofunde?**`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Salvar resposta nos dados clínicos
    const currentQuestion = clinicalQuestions.find(q => q.step === currentStep);
    if (currentQuestion) {
      setClinicalData(prev => ({
        ...prev,
        [currentQuestion.field]: input
      }));
    }

    const currentInput = input;
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      let assistantResponse = '';

      if (currentStep < clinicalQuestions.length) {
        // Próxima pergunta
        const nextStep = currentStep + 1;
        const nextQuestion = clinicalQuestions.find(q => q.step === nextStep);
        
        assistantResponse = `✅ **Informação registrada:** "${currentInput}"

${nextQuestion?.question || ''}`;
        
        setCurrentStep(nextStep);
      } else {
        // Gerar sugestão de formulação APENAS após todas as 7 perguntas
        const updatedData = {
          ...clinicalData,
          [currentQuestion?.field || '']: currentInput
        } as ClinicalData;
        
        assistantResponse = generateFormulationSuggestion(updatedData);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantResponse,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      
      if (currentStep >= clinicalQuestions.length) {
        toast({
          title: "✅ Anamnese Completa!",
          description: "Formulação magistral personalizada gerada com base nos 7 dados clínicos essenciais.",
        });
      }
    }, 2000); // Aumentei o tempo para simular análise mais profunda
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetAnamnesis = () => {
    setMessages([{
      id: '1',
      content: `Olá Dr(a). ${user.name}! 👨‍⚕️

Sou seu assistente para desenvolvimento de fórmulas magistrais personalizadas. Para criar a formulação mais adequada, preciso coletar informações clínicas do seu paciente através de uma anamnese estruturada.

São 7 perguntas essenciais que vou fazer sequencialmente:

**Pergunta 1 de 7:**
**Qual é a queixa principal do paciente?**
(Ex: acne inflamatória, melasma, queda capilar, ressecamento cutâneo, envelhecimento precoce, etc.)

Por favor, descreva detalhadamente a condição que precisa ser tratada.`,
      role: 'assistant',
      timestamp: new Date()
    }]);
    setCurrentStep(1);
    setClinicalData({});
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-3 text-slate-300">
              <Lightbulb className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium">Anamnese para Fórmulas Magistrais</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-400">
              Pergunta {Math.min(currentStep, clinicalQuestions.length)} de {clinicalQuestions.length}
            </span>
            <Button
              onClick={resetAnamnesis}
              variant="outline"
              size="sm"
              className="text-slate-400 hover:text-slate-200 border-slate-600"
            >
              Reiniciar
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="container mx-auto max-w-4xl">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <Card className={`max-w-[85%] p-4 ${
                message.role === 'user' 
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-none' 
                  : 'bg-slate-800 border-slate-700 text-slate-100'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-white/20' 
                      : 'bg-gradient-to-r from-purple-500 to-purple-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Lightbulb className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <Card className="max-w-[80%] p-4 bg-slate-800 border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processando dados clínicos...</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-slate-700 p-4 bg-slate-800">
        <div className="container mx-auto max-w-4xl">
          <div className="flex space-x-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                currentStep <= clinicalQuestions.length 
                  ? `Responda a pergunta ${currentStep} detalhadamente...`
                  : "Tem alguma dúvida sobre a formulação sugerida?"
              }
              className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-none min-h-[60px]"
              rows={2}
            />
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 h-fit"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionsChat;
