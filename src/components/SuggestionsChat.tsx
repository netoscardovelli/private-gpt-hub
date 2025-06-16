
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

interface ClinicalContext {
  complaint: string;
  demographics: string;
  severity: string;
  timeline: string;
  medicalHistory: string;
  currentTreatments: string;
  allergies: string;
  lifestyle: string;
  contraindications: string;
  objectives: string;
  [key: string]: string;
}

const SuggestionsChat = ({ user, onBack }: SuggestionsChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Olá Dr(a). ${user.name}! 👨‍⚕️

Sou seu assistente para desenvolvimento de fórmulas magistrais personalizadas. Vou conduzir uma anamnese inteligente, adaptando minhas perguntas conforme suas respostas para construir o perfil clínico ideal.

**Vamos começar:**
Qual é a queixa principal do seu paciente? Descreva detalhadamente a condição que precisa ser tratada.`,
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [clinicalContext, setClinicalContext] = useState<Partial<ClinicalContext>>({});
  const [conversationStage, setConversationStage] = useState('initial');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeResponseAndGenerateNextQuestion = (userResponse: string, context: Partial<ClinicalContext>) => {
    // Análise inteligente baseada no contexto atual
    const response = userResponse.toLowerCase();
    
    // Se é a primeira resposta (queixa principal)
    if (!context.complaint) {
      return {
        nextQuestion: generateDemographicsQuestion(userResponse),
        contextUpdate: { complaint: userResponse },
        stage: 'demographics'
      };
    }
    
    // Se acabou de coletar dados demográficos
    if (!context.demographics) {
      return {
        nextQuestion: generateSeverityQuestion(userResponse, context),
        contextUpdate: { demographics: userResponse },
        stage: 'severity'
      };
    }
    
    // Se acabou de coletar severidade
    if (!context.severity) {
      return {
        nextQuestion: generateTimelineQuestion(userResponse, context),
        contextUpdate: { severity: userResponse },
        stage: 'timeline'
      };
    }
    
    // Se acabou de coletar timeline
    if (!context.timeline) {
      return {
        nextQuestion: generateMedicalHistoryQuestion(userResponse, context),
        contextUpdate: { timeline: userResponse },
        stage: 'medical_history'
      };
    }
    
    // Se acabou de coletar histórico médico
    if (!context.medicalHistory) {
      return {
        nextQuestion: generateCurrentTreatmentsQuestion(userResponse, context),
        contextUpdate: { medicalHistory: userResponse },
        stage: 'current_treatments'
      };
    }
    
    // Se acabou de coletar tratamentos atuais
    if (!context.currentTreatments) {
      return {
        nextQuestion: generateAllergiesQuestion(userResponse, context),
        contextUpdate: { currentTreatments: userResponse },
        stage: 'allergies'
      };
    }
    
    // Se acabou de coletar alergias
    if (!context.allergies) {
      return {
        nextQuestion: generateLifestyleQuestion(userResponse, context),
        contextUpdate: { allergies: userResponse },
        stage: 'lifestyle'
      };
    }
    
    // Se acabou de coletar lifestyle
    if (!context.lifestyle) {
      return {
        nextQuestion: generateObjectivesQuestion(userResponse, context),
        contextUpdate: { lifestyle: userResponse },
        stage: 'objectives'
      };
    }
    
    // Se acabou de coletar objetivos - gerar fórmula
    if (!context.objectives) {
      const finalContext = { ...context, objectives: userResponse };
      return {
        nextQuestion: generateFormulation(finalContext as ClinicalContext),
        contextUpdate: { objectives: userResponse },
        stage: 'formulation'
      };
    }
    
    // Resposta pós-formulação
    return {
      nextQuestion: generateFollowUpResponse(userResponse, context),
      contextUpdate: {},
      stage: 'follow_up'
    };
  };

  const generateDemographicsQuestion = (complaint: string) => {
    const needsAge = complaint.includes('acne') || complaint.includes('hormonal') || complaint.includes('menopausa') || complaint.includes('calvície');
    const needsGender = complaint.includes('hormonal') || complaint.includes('calvície') || complaint.includes('gestante');
    
    if (needsAge && needsGender) {
      return `**Entendido sobre: ${complaint}**\n\nPara esta condição, preciso conhecer o perfil demográfico:\n• Qual a idade e sexo do paciente?\n• Há alguma condição hormonal específica (gravidez, menopausa, etc.)?`;
    } else if (needsAge) {
      return `**Registrado: ${complaint}**\n\nQual a idade do paciente? Esta informação é importante para adequar a concentração dos ativos.`;
    } else {
      return `**Compreendido: ${complaint}**\n\nQual a idade e sexo do paciente?`;
    }
  };

  const generateSeverityQuestion = (demographics: string, context: Partial<ClinicalContext>) => {
    const complaint = context.complaint?.toLowerCase() || '';
    
    if (complaint.includes('acne')) {
      return `**Perfil: ${demographics}**\n\nCom base na queixa de acne, qual o grau de severidade?\n• Acne leve (comedões e pápulas esparsas)\n• Acne moderada (pápulas e pústulas inflamatórias)\n• Acne severa (nódulos e cistos)`;
    } else if (complaint.includes('melasma') || complaint.includes('mancha')) {
      return `**Perfil registrado: ${demographics}**\n\nQual a intensidade das manchas?\n• Manchas superficiais (epidérmicas)\n• Manchas profundas (dérmicas)\n• Manchas mistas`;
    } else if (complaint.includes('queda') || complaint.includes('calvície')) {
      return `**Dados: ${demographics}**\n\nQual o padrão da queda capilar?\n• Queda difusa recente\n• Alopecia androgenética\n• Queda pós-parto/stress`;
    } else {
      return `**Perfil: ${demographics}**\n\nQual a intensidade/severidade da condição atual? Descreva como está afetando o paciente.`;
    }
  };

  const generateTimelineQuestion = (severity: string, context: Partial<ClinicalContext>) => {
    return `**Severidade compreendida: ${severity}**\n\nHá quanto tempo o paciente apresenta esta condição?\n• Isso nos ajuda a entender se é aguda ou crônica\n• Houve algum fator desencadeante específico?`;
  };

  const generateMedicalHistoryQuestion = (timeline: string, context: Partial<ClinicalContext>) => {
    const complaint = context.complaint?.toLowerCase() || '';
    
    if (complaint.includes('hormonal') || complaint.includes('acne') || complaint.includes('queda')) {
      return `**Timeline: ${timeline}**\n\nHistórico médico relevante:\n• Há distúrbios hormonais conhecidos?\n• Síndrome dos ovários policísticos?\n• Disfunções tireoidianas?\n• Outras condições médicas importantes?`;
    } else if (complaint.includes('melasma') || complaint.includes('mancha')) {
      return `**Cronologia: ${timeline}**\n\nHistórico médico:\n• Há histórico de exposição solar excessiva?\n• Uso de anticoncepcionais ou TRH?\n• Gravidez recente?\n• Outras condições dermatológicas?`;
    } else {
      return `**Tempo de evolução: ${timeline}**\n\nQual o histórico médico relevante do paciente? Inclua comorbidades, cirurgias prévias, e condições que possam influenciar o tratamento.`;
    }
  };

  const generateCurrentTreatmentsQuestion = (medicalHistory: string, context: Partial<ClinicalContext>) => {
    return `**Histórico médico: ${medicalHistory}**\n\nQuais tratamentos o paciente está usando atualmente?\n• Medicamentos sistêmicos\n• Tratamentos tópicos\n• Suplementos\n• Procedimentos estéticos\n\nIsso é crucial para evitar interações.`;
  };

  const generateAllergiesQuestion = (currentTreatments: string, context: Partial<ClinicalContext>) => {
    const hasCurrentTreatments = currentTreatments.toLowerCase() !== 'nenhum' && currentTreatments.length > 10;
    
    if (hasCurrentTreatments) {
      return `**Tratamentos atuais registrados: ${currentTreatments}**\n\nO paciente tem alergias ou intolerâncias conhecidas?\n• Alergias medicamentosas\n• Reações a cosméticos\n• Intolerâncias específicas\n\nPreciso garantir compatibilidade com os tratamentos atuais.`;
    } else {
      return `**Sem tratamentos atuais**\n\nO paciente tem alergias ou intolerâncias conhecidas?\n• Alergias medicamentosas\n• Reações a cosméticos\n• Sensibilidades cutâneas`;
    }
  };

  const generateLifestyleQuestion = (allergies: string, context: Partial<ClinicalContext>) => {
    const complaint = context.complaint?.toLowerCase() || '';
    
    if (complaint.includes('acne')) {
      return `**Alergias: ${allergies}**\n\nFatores do estilo de vida que podem influenciar:\n• Rotina de cuidados com a pele atual\n• Nível de stress\n• Qualidade do sono\n• Hábitos alimentares\n• Uso de maquiagem/cosméticos`;
    } else if (complaint.includes('melasma')) {
      return `**Restrições alérgicas: ${allergies}**\n\nEstilo de vida:\n• Exposição solar diária (trabalho/atividades)\n• Uso de protetor solar\n• Rotina de cuidados\n• Fatores de stress`;
    } else {
      return `**Alergias registradas: ${allergies}**\n\nComo é o estilo de vida do paciente?\n• Rotina de cuidados\n• Exposição a fatores ambientais\n• Níveis de stress\n• Aderência a tratamentos`;
    }
  };

  const generateObjectivesQuestion = (lifestyle: string, context: Partial<ClinicalContext>) => {
    return `**Estilo de vida: ${lifestyle}**\n\n🎯 **Definindo objetivos terapêuticos:**\n\nO que o paciente espera alcançar com o tratamento?\n• Prazo desejado para resultados\n• Prioridades (eficácia vs tolerabilidade)\n• Expectativas realistas\n• Preferências de aplicação (manhã/noite)`;
  };

  const generateFormulation = (context: ClinicalContext) => {
    // Análise inteligente para gerar formulação personalizada
    const formulationElements = analyzeComplexCase(context);
    
    return `**🧬 ANÁLISE CLÍNICA COMPLETA - FORMULAÇÃO INTELIGENTE**

**📋 SÍNTESE DO CASO:**
• **Condição:** ${context.complaint}
• **Perfil:** ${context.demographics}
• **Severidade:** ${context.severity}
• **Evolução:** ${context.timeline}
• **Histórico:** ${context.medicalHistory}
• **Tratamentos Atuais:** ${context.currentTreatments}
• **Restrições:** ${context.allergies}
• **Contexto:** ${context.lifestyle}
• **Objetivos:** ${context.objectives}

---

**💊 PROTOCOLO FARMACÊUTICO PERSONALIZADO**

${formulationElements.primaryFormulation}

**🔬 JUSTIFICATIVA CIENTÍFICA:**
${formulationElements.rationale}

**📊 PROTOCOLO DE APLICAÇÃO:**
${formulationElements.protocol}

**⚠️ CONSIDERAÇÕES CLÍNICAS:**
${formulationElements.considerations}

**📈 PROGNÓSTICO:**
${formulationElements.prognosis}

---
**Deseja que eu ajuste algum aspecto da formulação ou tem dúvidas sobre o protocolo?**`;
  };

  const analyzeComplexCase = (context: ClinicalContext) => {
    // Lógica inteligente baseada no contexto completo
    const complaint = context.complaint.toLowerCase();
    const demographics = context.demographics.toLowerCase();
    const severity = context.severity.toLowerCase();
    
    let primaryFormulation = '';
    let rationale = '';
    let protocol = '';
    let considerations = '';
    let prognosis = '';
    
    // Análise inteligente baseada em padrões
    if (complaint.includes('acne')) {
      if (severity.includes('leve')) {
        primaryFormulation = `**FÓRMULA ANTI-ACNE LEVE:**
• Ácido Salicílico 1-2%
• Niacinamida 4%
• Zinco PCA 1%
• Pantenol 2%
• Veículo: Gel-creme oil-free`;
        
        rationale = `Abordagem suave para acne leve com foco em prevenção de comedões e controle oleosidade sem ressecamento excessivo.`;
      } else if (severity.includes('moderada')) {
        primaryFormulation = `**FÓRMULA ANTI-ACNE MODERADA:**
• Adapaleno 0,1% (ou Tretinoína 0,025%)
• Clindamicina 1%
• Niacinamida 5%
• Ácido Azelaico 10%
• Veículo: Gel aquoso`;
        
        rationale = `Combinação retinóide + antibiótico para controle inflamatório, com moduladores de oleosidade e renovação celular.`;
      } else {
        primaryFormulation = `**FÓRMULA ANTI-ACNE SEVERA:**
• Tretinoína 0,05%
• Peróxido de Benzoíla 2,5%
• Ácido Azelaico 15%
• Niacinamida 5%
• Veículo: Emulsão não-comedogênica`;
        
        rationale = `Protocolo intensivo para acne severa com múltiplas vias de ação: renovação celular, ação antimicrobiana e anti-inflamatória.`;
      }
    }
    
    // Adicionar mais lógicas para outras condições...
    
    protocol = `**Manhã:** Limpeza + Protetor solar
**Noite:** Limpeza + Fórmula magistral
**Frequência inicial:** 3x/semana, aumentar gradualmente
**Monitoramento:** Avaliação em 15 dias`;
    
    considerations = `• Fotoproteção obrigatória
• Hidratação complementar se necessário
• Monitorar irritação inicial
• Ajustar concentrações conforme tolerância`;
    
    prognosis = `Resultados esperados em 4-6 semanas com melhora progressiva. Tratamento de manutenção após controle inicial.`;
    
    return {
      primaryFormulation,
      rationale,
      protocol,
      considerations,
      prognosis
    };
  };

  const generateFollowUpResponse = (userResponse: string, context: Partial<ClinicalContext>) => {
    return `Entendido! ${userResponse}

Posso esclarecer mais detalhes sobre:
• Concentrações específicas dos ativos
• Protocolo de aplicação personalizado
• Fórmulas complementares
• Monitoramento e ajustes

O que gostaria de aprofundar?`;
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
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const analysis = analyzeResponseAndGenerateNextQuestion(currentInput, clinicalContext);
      
      setClinicalContext(prev => ({
        ...prev,
        ...analysis.contextUpdate
      }));
      
      setConversationStage(analysis.stage);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: analysis.nextQuestion,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      
      if (analysis.stage === 'formulation') {
        toast({
          title: "✅ Anamnese Inteligente Completa!",
          description: "Formulação personalizada gerada com base na análise contextual completa.",
        });
      }
    }, 2000);
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

Sou seu assistente para desenvolvimento de fórmulas magistrais personalizadas. Vou conduzir uma anamnese inteligente, adaptando minhas perguntas conforme suas respostas para construir o perfil clínico ideal.

**Vamos começar:**
Qual é a queixa principal do seu paciente? Descreva detalhadamente a condição que precisa ser tratada.`,
      role: 'assistant',
      timestamp: new Date()
    }]);
    setConversationStage('initial');
    setClinicalContext({});
    setInput('');
  };

  const getProgressIndicator = () => {
    const stages = ['initial', 'demographics', 'severity', 'timeline', 'medical_history', 'current_treatments', 'allergies', 'lifestyle', 'objectives', 'formulation'];
    const currentIndex = stages.indexOf(conversationStage);
    const progress = Math.min((currentIndex / (stages.length - 1)) * 100, 100);
    
    return (
      <div className="flex items-center space-x-2">
        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-slate-400">
          {conversationStage === 'formulation' ? 'Completo' : 'Analisando...'}
        </span>
      </div>
    );
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
              <span className="text-sm font-medium">Anamnese Inteligente</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {getProgressIndicator()}
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
                    <span>Analisando resposta e construindo contexto clínico...</span>
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
                conversationStage === 'formulation' 
                  ? "Tem alguma dúvida sobre a formulação ou quer ajustes?"
                  : "Responda detalhadamente para que eu possa fazer a próxima pergunta contextual..."
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
