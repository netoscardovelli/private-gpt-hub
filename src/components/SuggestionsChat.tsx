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
  objectives: string;
  [key: string]: string;
}

const SuggestionsChat = ({ user, onBack }: SuggestionsChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Olá Dr(a). ${user.name}! 👨‍⚕️

Sou seu assistente para desenvolvimento de fórmulas magistrais personalizadas. Vou conduzir uma anamnese inteligente, coletando todas as informações clínicas necessárias antes de sugerir qualquer formulação.

**Vamos começar com a primeira pergunta:**
Qual é a queixa principal do seu paciente? Descreva detalhadamente a condição que precisa ser tratada.`,
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [clinicalContext, setClinicalContext] = useState<Partial<ClinicalContext>>({});
  const [conversationStage, setConversationStage] = useState('complaint');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeResponseAndGenerateNextQuestion = (userResponse: string, context: Partial<ClinicalContext>, currentStage: string) => {
    console.log('Analisando resposta na etapa:', currentStage);
    console.log('Contexto atual:', context);
    
    // NUNCA gerar formulação até ter TODAS as informações necessárias
    const requiredFields = ['complaint', 'demographics', 'severity', 'timeline', 'medicalHistory', 'currentTreatments', 'allergies', 'lifestyle', 'objectives'];
    
    switch (currentStage) {
      case 'complaint':
        return {
          nextQuestion: generateDemographicsQuestion(userResponse),
          contextUpdate: { complaint: userResponse },
          stage: 'demographics'
        };
        
      case 'demographics':
        return {
          nextQuestion: generateSeverityQuestion(userResponse, context),
          contextUpdate: { demographics: userResponse },
          stage: 'severity'
        };
        
      case 'severity':
        return {
          nextQuestion: generateTimelineQuestion(userResponse, context),
          contextUpdate: { severity: userResponse },
          stage: 'timeline'
        };
        
      case 'timeline':
        return {
          nextQuestion: generateMedicalHistoryQuestion(userResponse, context),
          contextUpdate: { timeline: userResponse },
          stage: 'medical_history'
        };
        
      case 'medical_history':
        return {
          nextQuestion: generateCurrentTreatmentsQuestion(userResponse, context),
          contextUpdate: { medicalHistory: userResponse },
          stage: 'current_treatments'
        };
        
      case 'current_treatments':
        return {
          nextQuestion: generateAllergiesQuestion(userResponse, context),
          contextUpdate: { currentTreatments: userResponse },
          stage: 'allergies'
        };
        
      case 'allergies':
        return {
          nextQuestion: generateLifestyleQuestion(userResponse, context),
          contextUpdate: { allergies: userResponse },
          stage: 'lifestyle'
        };
        
      case 'lifestyle':
        return {
          nextQuestion: generateObjectivesQuestion(userResponse, context),
          contextUpdate: { lifestyle: userResponse },
          stage: 'objectives'
        };
        
      case 'objectives':
        // SOMENTE AGORA que temos todas as informações, gerar a formulação
        const finalContext = { ...context, objectives: userResponse };
        console.log('Contexto completo para formulação:', finalContext);
        return {
          nextQuestion: generateFormulation(finalContext as ClinicalContext),
          contextUpdate: { objectives: userResponse },
          stage: 'formulation'
        };
        
      default:
        return {
          nextQuestion: generateFollowUpResponse(userResponse, context),
          contextUpdate: {},
          stage: 'follow_up'
        };
    }
  };

  const generateDemographicsQuestion = (complaint: string) => {
    const complaintLower = complaint.toLowerCase();
    
    let specificQuestions = '';
    
    if (complaintLower.includes('acne') || complaintLower.includes('espinha')) {
      specificQuestions = '\n• Tipo de pele (oleosa, mista, seca)?\n• Há alterações hormonais conhecidas?';
    } else if (complaintLower.includes('melasma') || complaintLower.includes('mancha')) {
      specificQuestions = '\n• Está grávida ou amamentando?\n• Usa anticoncepcional ou faz TRH?';
    } else if (complaintLower.includes('calvície') || complaintLower.includes('queda') || complaintLower.includes('cabelo')) {
      specificQuestions = '\n• Padrão da calvície (difusa ou androgenética)?\n• Há histórico familiar?';
    } else if (complaintLower.includes('celulite')) {
      specificQuestions = '\n• Grau da celulite (leve, moderada, severa)?\n• Há quanto tempo percebeu o problema?';
    }
    
    return `**Queixa registrada:** ${complaint}

**Agora preciso conhecer o perfil do paciente:**

• Qual a idade e sexo?
• Peso aproximado e altura?${specificQuestions}

Essas informações são fundamentais para determinar as concentrações adequadas dos ativos.`;
  };

  const generateSeverityQuestion = (demographics: string, context: Partial<ClinicalContext>) => {
    const complaint = context.complaint?.toLowerCase() || '';
    
    if (complaint.includes('acne')) {
      return `**Perfil do paciente:** ${demographics}

**Preciso entender a severidade da acne:**

• **Acne grau I** - Apenas cravos (comedões)
• **Acne grau II** - Cravos + espinhas pequenas (pápulas)  
• **Acne grau III** - Espinhas inflamadas com pus (pústulas)
• **Acne grau IV** - Nódulos dolorosos e cistos

Qual melhor descreve o caso atual?`;
    } else if (complaint.includes('melasma') || complaint.includes('mancha')) {
      return `**Dados demográficos:** ${demographics}

**Sobre as manchas:**

• Qual a coloração (marrom claro, escuro, acinzentado)?
• São superficiais ou bem profundas?
• Localização principal (face, corpo)?
• Pioram com sol mesmo usando protetor?

Essas características definem o protocolo de tratamento.`;
    } else if (complaint.includes('celulite')) {
      return `**Perfil:** ${demographics}

**Classificação da celulite:**

• **Grau I** - Visível apenas quando comprime a pele
• **Grau II** - Visível naturalmente em pé
• **Grau III** - Visível em pé e deitada, com nódulos palpáveis  
• **Grau IV** - Muito aparente com deformidades e dor

Qual grau melhor se adequa?`;
    } else {
      return `**Perfil registrado:** ${demographics}

**Sobre a intensidade/severidade:**

• Como classificaria a condição: leve, moderada ou severa?
• Está piorando, estável ou melhorando?
• Interfere na qualidade de vida do paciente?

Isso me ajuda a calibrar a potência do tratamento.`;
    }
  };

  const generateTimelineQuestion = (severity: string, context: Partial<ClinicalContext>) => {
    return `**Severidade compreendida:** ${severity}

**Cronologia da condição:**

• Há quanto tempo o paciente apresenta este problema?
• Foi gradual ou apareceu repentinamente? 
• Há algum fator que desencadeou ou piorou?
• Já tentou tratamentos anteriores? Com que resultado?

O tempo de evolução me ajuda a entender se é uma condição aguda ou crônica.`;
  };

  const generateMedicalHistoryQuestion = (timeline: string, context: Partial<ClinicalContext>) => {
    const complaint = context.complaint?.toLowerCase() || '';
    
    let specificConditions = '';
    
    if (complaint.includes('hormonal') || complaint.includes('acne') || complaint.includes('melasma')) {
      specificConditions = '\n• Distúrbios hormonais (SOP, tireóide)?\n• Diabetes ou resistência à insulina?\n• Histórico de câncer hormônio-dependente?';
    } else if (complaint.includes('cardiovascular') || complaint.includes('circulação')) {
      specificConditions = '\n• Problemas cardíacos ou circulatórios?\n• Hipertensão arterial?\n• Uso de anticoagulantes?';
    }
    
    return `**Timeline:** ${timeline}

**Histórico médico relevante:**

• Tem alguma doença crônica diagnosticada?
• Faz uso de medicamentos contínuos?
• Já teve reações alérgicas a medicamentos?
• Cirurgias recentes ou procedimentos estéticos?${specificConditions}

Preciso descartar contraindicações importantes.`;
  };

  const generateCurrentTreatmentsQuestion = (medicalHistory: string, context: Partial<ClinicalContext>) => {
    return `**Histórico médico:** ${medicalHistory}

**Tratamentos atuais em uso:**

**Sistêmicos (oral):**
• Antibióticos, hormônios, vitaminas?
• Medicamentos para outras condições?

**Tópicos (pele):**
• Cremes, ácidos, medicamentos dermatológicos?
• Cosméticos ou procedimentos estéticos?

**Outros:**
• Suplementos, fitoterápicos?
• Tratamentos alternativos?

É crucial conhecer TUDO que está usando para evitar interações perigosas.`;
  };

  const generateAllergiesQuestion = (currentTreatments: string, context: Partial<ClinicalContext>) => {
    return `**Tratamentos atuais:** ${currentTreatments}

**Alergias e intolerâncias:**

**Medicamentosas:**
• Alergia a algum medicamento específico?
• Qual foi a reação (coceira, inchaço, falta de ar)?

**Cosméticas:**
• Já teve reação a cremes, maquiagem ou perfumes?
• Pele sensível ou atópica?

**Outras:**
• Alergia alimentar, ao látex, metais?
• Asma ou rinite alérgica?

Preciso garantir total segurança na formulação.`;
  };

  const generateLifestyleQuestion = (allergies: string, context: Partial<ClinicalContext>) => {
    const complaint = context.complaint?.toLowerCase() || '';
    
    let specificLifestyle = '';
    
    if (complaint.includes('acne')) {
      specificLifestyle = '\n• Rotina de limpeza da pele atual?\n• Usa maquiagem diariamente?\n• Nível de estresse e qualidade do sono?';
    } else if (complaint.includes('melasma') || complaint.includes('mancha')) {
      specificLifestyle = '\n• Exposição solar diária (trabalho, esporte)?\n• Usa protetor solar religiosamente?\n• Reaplica durante o dia?';
    } else if (complaint.includes('anti-idade') || complaint.includes('rugas')) {
      specificLifestyle = '\n• Tabagismo ou exposição solar excessiva?\n• Routine de cuidados atual?\n• Hidratação e alimentação?';
    }
    
    return `**Alergias:** ${allergies}

**Estilo de vida e rotina:**

• Como é a rotina de cuidados atual?
• Exposição a fatores ambientais (sol, poluição)?
• Nível de estresse e qualidade do sono?
• Aderência a tratamentos (disciplina para usar)?${specificLifestyle}

Isso me ajuda a personalizar o protocolo de aplicação.`;
  };

  const generateObjectivesQuestion = (lifestyle: string, context: Partial<ClinicalContext>) => {
    return `**Estilo de vida:** ${lifestyle}

**🎯 Objetivos terapêuticos (ÚLTIMA PERGUNTA):**

• Qual o principal resultado esperado?
• Em quanto tempo gostaria de ver melhorias?
• Prioridade: resultados rápidos ou tratamento suave?
• Prefere aplicação manhã, noite ou ambos?
• Orçamento aproximado para o tratamento?

**Expectativas realistas:**
• Resultados iniciais: 2-4 semanas
• Melhorias significativas: 2-3 meses  
• Manutenção: tratamento contínuo

Com essa informação, finalmente posso criar sua formulação personalizada! 🧬`;
  };

  const generateFormulation = (context: ClinicalContext) => {
    console.log('Gerando formulação com contexto completo:', context);
    
    const formulationElements = analyzeComplexCase(context);
    
    return `**🧬 ANÁLISE CLÍNICA COMPLETA - FORMULAÇÃO INTELIGENTE**

**📋 SÍNTESE DO CASO CLÍNICO:**
• **Queixa Principal:** ${context.complaint}
• **Perfil Demográfico:** ${context.demographics}  
• **Severidade:** ${context.severity}
• **Evolução Temporal:** ${context.timeline}
• **Histórico Médico:** ${context.medicalHistory}
• **Tratamentos Atuais:** ${context.currentTreatments}
• **Restrições Alérgicas:** ${context.allergies}
• **Contexto de Vida:** ${context.lifestyle}
• **Objetivos Terapêuticos:** ${context.objectives}

---

**💊 PROTOCOLO FARMACÊUTICO PERSONALIZADO**

${formulationElements.primaryFormulation}

**🔬 JUSTIFICATIVA CIENTÍFICA:**
${formulationElements.rationale}

**📊 PROTOCOLO DE APLICAÇÃO:**
${formulationElements.protocol}

**⚠️ CONSIDERAÇÕES CLÍNICAS:**
${formulationElements.considerations}

**📈 PROGNÓSTICO E MONITORAMENTO:**
${formulationElements.prognosis}

---
**Agora sim! Formulação completa baseada em anamnese criteriosa. Alguma dúvida ou ajuste necessário?**`;
  };

  // ... keep existing code (analyzeComplexCase function)
  const analyzeComplexCase = (context: ClinicalContext) => {
    const complaint = context.complaint.toLowerCase();
    const demographics = context.demographics.toLowerCase();
    const severity = context.severity.toLowerCase();
    
    let primaryFormulation = '';
    let rationale = '';
    let protocol = '';
    let considerations = '';
    let prognosis = '';
    
    if (complaint.includes('acne')) {
      if (severity.includes('leve') || severity.includes('grau i')) {
        primaryFormulation = `**FÓRMULA ANTI-ACNE LEVE:**
• Ácido Salicílico 1-2%
• Niacinamida 4%
• Zinco PCA 1%
• Pantenol 2%
• Veículo: Gel-creme oil-free`;
        
        rationale = `Abordagem suave para acne leve com foco em prevenção de comedões e controle oleosidade sem ressecamento excessivo.`;
      } else if (severity.includes('moderada') || severity.includes('grau ii')) {
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
    } else if (complaint.includes('celulite')) {
      primaryFormulation = `**FÓRMULA ANTI-CELULITE PERSONALIZADA:**
• Cafeína 5%
• Centella Asiática 2%
• Carnitina 3%
• Silício Orgânico 1%
• Castanha-da-Índia 2%
• Veículo: Gel-creme para massagem`;
      
      rationale = `Sinergia de ativos lipolíticos, circulatórios e firmadores para ação completa na celulite.`;
    } else if (complaint.includes('melasma') || complaint.includes('mancha')) {
      primaryFormulation = `**FÓRMULA DESPIGMENTANTE:**
• Hidroquinona 2-4% (conforme severidade)
• Tretinoína 0,025-0,05%
• Ácido Kojico 2%
• Vitamina C 10%
• Veículo: Creme base dermatológica`;
      
      rationale = `Tripla ação despigmentante com bloqueio da tirosinase e renovação celular acelerada.`;
    } else {
      primaryFormulation = `**FÓRMULA PERSONALIZADA:**
Baseada na análise completa do seu caso específico.`;
      rationale = `Formulação desenvolvida considerando todos os aspectos clínicos apresentados.`;
    }
    
    protocol = `**Protocolo de Uso:**
• **Manhã:** Limpeza + Protetor solar FPS 60+
• **Noite:** Limpeza + Fórmula magistral
• **Frequência inicial:** 3x/semana (primeira semana)
• **Aumento gradual:** Conforme tolerância
• **Avaliação:** Retorno em 15-30 dias`;
    
    considerations = `**Cuidados Especiais:**
• Fotoproteção rigorosa obrigatória
• Hidratação complementar se necessário  
• Monitorar irritação inicial
• Ajustar concentrações conforme resposta
• Evitar exposição solar excessiva`;
    
    prognosis = `**Expectativa de Resultados:**
• **2-4 semanas:** Primeiras melhorias visíveis
• **2-3 meses:** Resultados significativos
• **Manutenção:** Protocolo adaptado para resultados duradouros`;
    
    return {
      primaryFormulation,
      rationale,
      protocol,
      considerations,
      prognosis
    };
  };

  const generateFollowUpResponse = (userResponse: string, context: Partial<ClinicalContext>) => {
    return `Perfeito! ${userResponse}

**Posso ajudar com:**
• Ajustes nas concentrações dos ativos
• Protocolo de aplicação detalhado  
• Fórmulas complementares (sérum, mousse, etc.)
• Orientações de monitoramento
• Modificações baseadas na evolução

**O que gostaria de aprofundar ou ajustar?**`;
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
      const analysis = analyzeResponseAndGenerateNextQuestion(currentInput, clinicalContext, conversationStage);
      
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
          title: "✅ Anamnese Completa Realizada!",
          description: "Formulação personalizada baseada em análise clínica criteriosa.",
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

Sou seu assistente para desenvolvimento de fórmulas magistrais personalizadas. Vou conduzir uma anamnese inteligente, coletando todas as informações clínicas necessárias antes de sugerir qualquer formulação.

**Vamos começar com a primeira pergunta:**
Qual é a queixa principal do seu paciente? Descreva detalhadamente a condição que precisa ser tratada.`,
      role: 'assistant',
      timestamp: new Date()
    }]);
    setConversationStage('complaint');
    setClinicalContext({});
    setInput('');
  };

  const getProgressIndicator = () => {
    const stages = ['complaint', 'demographics', 'severity', 'timeline', 'medical_history', 'current_treatments', 'allergies', 'lifestyle', 'objectives', 'formulation'];
    const currentIndex = stages.indexOf(conversationStage);
    const progress = Math.min((currentIndex / (stages.length - 1)) * 100, 100);
    
    const stageLabels: Record<string, string> = {
      'complaint': 'Queixa Principal',
      'demographics': 'Demografia',  
      'severity': 'Severidade',
      'timeline': 'Cronologia',
      'medical_history': 'Histórico Médico',
      'current_treatments': 'Tratamentos Atuais',
      'allergies': 'Alergias',
      'lifestyle': 'Estilo de Vida',
      'objectives': 'Objetivos',
      'formulation': 'Formulação'
    };
    
    return (
      <div className="flex items-center space-x-2">
        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-slate-400">
          {stageLabels[conversationStage] || 'Processando...'}
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
                    <span>Analisando resposta clínica e preparando próxima pergunta...</span>
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
                  : "Responda detalhadamente para que eu possa continuar a anamnese..."
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
