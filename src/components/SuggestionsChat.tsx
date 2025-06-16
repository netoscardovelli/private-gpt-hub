
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

Sou seu assistente para desenvolvimento de fórmulas magistrais personalizadas. Vou conduzir uma anamnese inteligente, coletando **TODAS** as informações clínicas necessárias antes de sugerir qualquer formulação.

**🔍 IMPORTANTE:** Vou fazer 9 perguntas obrigatórias sequenciais. Só após responder TODAS elas é que terei dados suficientes para criar uma formulação segura e eficaz.

**PERGUNTA 1/9 - QUEIXA PRINCIPAL:**
Qual é a queixa principal do seu paciente? Descreva detalhadamente a condição que precisa ser tratada.`,
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [clinicalContext, setClinicalContext] = useState<Partial<ClinicalContext>>({});
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // CONTROLE RIGOROSO - NUNCA pular etapas
  const ANAMNESIS_STAGES = [
    'complaint',
    'demographics', 
    'severity',
    'timeline',
    'medical_history',
    'current_treatments',
    'allergies',
    'lifestyle',
    'objectives'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateNextQuestion = (userResponse: string, currentStage: number) => {
    console.log(`🔍 Pergunta atual: ${currentStage}/9`);
    console.log(`📝 Resposta recebida: ${userResponse}`);
    
    // Atualizar contexto clínico baseado na pergunta atual
    const stageKey = ANAMNESIS_STAGES[currentStage - 1];
    const updatedContext = { ...clinicalContext, [stageKey]: userResponse };
    setClinicalContext(updatedContext);
    
    // Se chegou na pergunta 9, gerar formulação após a resposta
    if (currentStage === 9) {
      console.log('✅ ANAMNESE COMPLETA! Gerando formulação...');
      return {
        content: generateFormulation(updatedContext as ClinicalContext),
        nextQuestionNumber: 10
      };
    }

    // Continuar com as perguntas sequenciais
    const nextQuestionNumber = currentStage + 1;
    let nextQuestion = '';
    
    switch (nextQuestionNumber) {
      case 2:
        nextQuestion = generateDemographicsQuestion(userResponse);
        break;
      case 3:
        nextQuestion = generateSeverityQuestion(userResponse, updatedContext);
        break;
      case 4:
        nextQuestion = generateTimelineQuestion(userResponse, updatedContext);
        break;
      case 5:
        nextQuestion = generateMedicalHistoryQuestion(userResponse, updatedContext);
        break;
      case 6:
        nextQuestion = generateCurrentTreatmentsQuestion(userResponse, updatedContext);
        break;
      case 7:
        nextQuestion = generateAllergiesQuestion(userResponse, updatedContext);
        break;
      case 8:
        nextQuestion = generateLifestyleQuestion(userResponse, updatedContext);
        break;
      case 9:
        nextQuestion = generateObjectivesQuestion(userResponse, updatedContext);
        break;
      default:
        nextQuestion = generateFollowUpResponse(userResponse, updatedContext);
        break;
    }
    
    return {
      content: nextQuestion,
      nextQuestionNumber: nextQuestionNumber
    };
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
    } else if (complaintLower.includes('dor') || complaintLower.includes('articular') || complaintLower.includes('artrite')) {
      specificQuestions = '\n• Há diagnóstico médico específico?\n• Quais articulações são mais afetadas?';
    }
    
    return `✅ **Queixa registrada:** ${complaint}

**PERGUNTA 2/9 - PERFIL DEMOGRÁFICO:**

Preciso conhecer o perfil do paciente para calcular dosagens adequadas:

• Qual a idade e sexo?
• Peso aproximado e altura?${specificQuestions}

**⚠️ IMPORTANTE:** Só passarei para a próxima pergunta após receber essas informações completas.`;
  };

  const generateSeverityQuestion = (demographics: string, context: Partial<ClinicalContext>) => {
    const complaint = context.complaint?.toLowerCase() || '';
    
    if (complaint.includes('acne')) {
      return `✅ **Perfil registrado:** ${demographics}

**PERGUNTA 3/9 - SEVERIDADE DA ACNE:**

• **Acne grau I** - Apenas cravos (comedões)
• **Acne grau II** - Cravos + espinhas pequenas (pápulas)  
• **Acne grau III** - Espinhas inflamadas com pus (pústulas)
• **Acne grau IV** - Nódulos dolorosos e cistos

Qual melhor descreve o caso atual? Esta classificação é crucial para definir a potência dos ativos.`;
    } else if (complaint.includes('melasma') || complaint.includes('mancha')) {
      return `✅ **Perfil registrado:** ${demographics}

**PERGUNTA 3/9 - CARACTERÍSTICAS DAS MANCHAS:**

• Qual a coloração (marrom claro, escuro, acinzentado)?
• São superficiais ou bem profundas?
• Localização principal (face, corpo)?
• Pioram com sol mesmo usando protetor?

Essas características definem o protocolo de tratamento.`;
    } else if (complaint.includes('dor') || complaint.includes('articular')) {
      return `✅ **Perfil registrado:** ${demographics}

**PERGUNTA 3/9 - INTENSIDADE DA DOR:**

• Em uma escala de 0-10, qual a intensidade da dor?
• A dor é constante ou apenas com movimento?
• Há rigidez matinal? Por quanto tempo?
• A dor melhora ou piora com atividade física?

Esta avaliação é fundamental para determinar a abordagem terapêutica.`;
    } else {
      return `✅ **Perfil registrado:** ${demographics}

**PERGUNTA 3/9 - INTENSIDADE/SEVERIDADE:**

• Como classificaria a condição: leve, moderada ou severa?
• Está piorando, estável ou melhorando?
• Interfere na qualidade de vida do paciente?

Isso me ajuda a calibrar a potência do tratamento.`;
    }
  };

  const generateTimelineQuestion = (severity: string, context: Partial<ClinicalContext>) => {
    return `✅ **Severidade compreendida:** ${severity}

**PERGUNTA 4/9 - CRONOLOGIA DA CONDIÇÃO:**

• Há quanto tempo o paciente apresenta este problema?
• Foi gradual ou apareceu repentinamente? 
• Há algum fator que desencadeou ou piorou?
• Já tentou tratamentos anteriores? Com que resultado?

O tempo de evolução me ajuda a entender se é uma condição aguda ou crônica, influenciando diretamente o protocolo.`;
  };

  const generateMedicalHistoryQuestion = (timeline: string, context: Partial<ClinicalContext>) => {
    const complaint = context.complaint?.toLowerCase() || '';
    
    let specificConditions = '';
    
    if (complaint.includes('hormonal') || complaint.includes('acne') || complaint.includes('melasma')) {
      specificConditions = '\n• Distúrbios hormonais (SOP, tireóide)?\n• Diabetes ou resistência à insulina?\n• Histórico de câncer hormônio-dependente?';
    } else if (complaint.includes('cardiovascular') || complaint.includes('circulação')) {
      specificConditions = '\n• Problemas cardíacos ou circulatórios?\n• Hipertensão arterial?\n• Uso de anticoagulantes?';
    } else if (complaint.includes('dor') || complaint.includes('articular')) {
      specificConditions = '\n• Artrite, artrose ou outras doenças articulares?\n• Fibromialgia ou outras síndromes dolorosas?\n• Lesões ou cirurgias articulares anteriores?';
    }
    
    return `✅ **Timeline registrada:** ${timeline}

**PERGUNTA 5/9 - HISTÓRICO MÉDICO RELEVANTE:**

• Tem alguma doença crônica diagnosticada?
• Faz uso de medicamentos contínuos?
• Já teve reações alérgicas a medicamentos?
• Cirurgias recentes ou procedimentos estéticos?${specificConditions}

**⚠️ CRUCIAL:** Preciso descartar contraindicações importantes antes de formular.`;
  };

  const generateCurrentTreatmentsQuestion = (medicalHistory: string, context: Partial<ClinicalContext>) => {
    return `✅ **Histórico médico registrado:** ${medicalHistory}

**PERGUNTA 6/9 - TRATAMENTOS ATUAIS EM USO:**

**Sistêmicos (oral):**
• Antibióticos, hormônios, vitaminas?
• Medicamentos para outras condições?

**Tópicos (pele):**
• Cremes, ácidos, medicamentos dermatológicos?
• Cosméticos ou procedimentos estéticos?

**Outros:**
• Suplementos, fitoterápicos?
• Tratamentos alternativos?

**⚠️ FUNDAMENTAL:** É crucial conhecer TUDO que está usando para evitar interações perigosas.`;
  };

  const generateAllergiesQuestion = (currentTreatments: string, context: Partial<ClinicalContext>) => {
    return `✅ **Tratamentos atuais registrados:** ${currentTreatments}

**PERGUNTA 7/9 - ALERGIAS E INTOLERÂNCIAS:**

**Medicamentosas:**
• Alergia a algum medicamento específico?
• Qual foi a reação (coceira, inchaço, falta de ar)?

**Cosméticas:**
• Já teve reação a cremes, maquiagem ou perfumes?
• Pele sensível ou atópica?

**Outras:**
• Alergia alimentar, ao látex, metais?
• Asma ou rinite alérgica?

**⚠️ SEGURANÇA:** Preciso garantir total segurança na formulação.`;
  };

  const generateLifestyleQuestion = (allergies: string, context: Partial<ClinicalContext>) => {
    const complaint = context.complaint?.toLowerCase() || '';
    
    let specificLifestyle = '';
    
    if (complaint.includes('acne')) {
      specificLifestyle = '\n• Rotina de limpeza da pele atual?\n• Usa maquiagem diariamente?\n• Nível de estresse e qualidade do sono?';
    } else if (complaint.includes('melasma') || complaint.includes('mancha')) {
      specificLifestyle = '\n• Exposição solar diária (trabalho, esporte)?\n• Usa protetor solar religiosamente?\n• Reaplica durante o dia?';
    } else if (complaint.includes('dor') || complaint.includes('articular')) {
      specificLifestyle = '\n• Nível de atividade física atual?\n• Trabalho envolve esforço repetitivo?\n• Qualidade do sono (dor noturna)?';
    }
    
    return `✅ **Alergias registradas:** ${allergies}

**PERGUNTA 8/9 - ESTILO DE VIDA E ROTINA:**

• Como é a rotina de cuidados atual?
• Exposição a fatores ambientais (sol, poluição)?
• Nível de estresse e qualidade do sono?
• Aderência a tratamentos (disciplina para usar)?${specificLifestyle}

Isso me ajuda a personalizar o protocolo de aplicação e prever aderência.`;
  };

  const generateObjectivesQuestion = (lifestyle: string, context: Partial<ClinicalContext>) => {
    return `✅ **Estilo de vida registrado:** ${lifestyle}

**PERGUNTA 9/9 - OBJETIVOS TERAPÊUTICOS (ÚLTIMA PERGUNTA!):**

• Qual o principal resultado esperado?
• Em quanto tempo gostaria de ver melhorias?
• Prioridade: resultados rápidos ou tratamento suave?
• Prefere aplicação manhã, noite ou ambos?
• Orçamento aproximado para o tratamento?

**🎯 EXPECTATIVAS REALISTAS:**
• Resultados iniciais: 2-4 semanas
• Melhorias significativas: 2-3 meses  
• Manutenção: tratamento contínuo

**🧬 APÓS SUA RESPOSTA:** Finalmente terei dados completos para criar sua formulação personalizada baseada em anamnese criteriosa!`;
  };

  const generateFormulation = (context: ClinicalContext) => {
    console.log('🧬 GERANDO FORMULAÇÃO COM TODOS OS DADOS:', context);
    
    const formulationElements = analyzeComplexCase(context);
    
    return `**🎉 ANAMNESE FINALIZADA COM SUCESSO! 🎉**

**🧬 ANÁLISE CLÍNICA COMPLETA - FORMULAÇÃO INTELIGENTE**

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
**✅ Formulação completa baseada em anamnese criteriosa com TODAS as informações necessárias coletadas! Alguma dúvida ou ajuste necessário?**`;
  };

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
    } else if (complaint.includes('dor') || complaint.includes('articular')) {
      primaryFormulation = `**FÓRMULA ANTI-INFLAMATÓRIA PARA DOR ARTICULAR:**
• Curcumina 500mg
• Boswellia serrata 300mg
• Glucosamina 1500mg
• Condroitina 1200mg
• MSM 1000mg
• Vitamina D3 2000UI
• Veículo: Cápsulas`;
      
      rationale = `Sinergia anti-inflamatória e regenerativa para proteção articular e alívio da dor.`;
    } else {
      primaryFormulation = `**FÓRMULA PERSONALIZADA:**
Baseada na análise completa do seu caso específico com todos os dados coletados.`;
      rationale = `Formulação desenvolvida considerando todos os aspectos clínicos apresentados durante a anamnese.`;
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
      // NUNCA gerar formulação antes de completar as 9 perguntas
      if (currentQuestionNumber <= 9) {
        const nextQuestionData = generateNextQuestion(currentInput, currentQuestionNumber);
        
        setCurrentQuestionNumber(nextQuestionData.nextQuestionNumber);

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: nextQuestionData.content,
          role: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        
        if (nextQuestionData.nextQuestionNumber === 10) {
          toast({
            title: "✅ Anamnese Completa Finalizada!",
            description: "Formulação personalizada baseada em análise clínica criteriosa com TODAS as informações coletadas.",
          });
        }
      } else {
        // Após a formulação, responder com follow-ups
        const followUpResponse = generateFollowUpResponse(currentInput, clinicalContext);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: followUpResponse,
          role: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
      
      setIsLoading(false);
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

Sou seu assistente para desenvolvimento de fórmulas magistrais personalizadas. Vou conduzir uma anamnese inteligente, coletando **TODAS** as informações clínicas necessárias antes de sugerir qualquer formulação.

**🔍 IMPORTANTE:** Vou fazer 9 perguntas obrigatórias sequenciais. Só após responder TODAS elas é que terei dados suficientes para criar uma formulação segura e eficaz.

**PERGUNTA 1/9 - QUEIXA PRINCIPAL:**
Qual é a queixa principal do seu paciente? Descreva detalhadamente a condição que precisa ser tratada.`,
      role: 'assistant',
      timestamp: new Date()
    }]);
    setCurrentQuestionNumber(1);
    setClinicalContext({});
    setInput('');
  };

  const getProgressIndicator = () => {
    const progress = Math.min((currentQuestionNumber / 9) * 100, 100);
    
    const stageLabels: Record<number, string> = {
      1: 'Queixa Principal',
      2: 'Demografia',  
      3: 'Severidade',
      4: 'Cronologia',
      5: 'Histórico Médico',
      6: 'Tratamentos Atuais',
      7: 'Alergias',
      8: 'Estilo de Vida',
      9: 'Objetivos',
      10: 'Formulação Gerada'
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
          {currentQuestionNumber <= 9 ? `${currentQuestionNumber}/9 - ${stageLabels[currentQuestionNumber] || 'Processando...'}` : 'Completo'}
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
                currentQuestionNumber > 9
                  ? "Tem alguma dúvida sobre a formulação ou quer ajustes?"
                  : `Responda à pergunta ${currentQuestionNumber}/9 para continuar a anamnese...`
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
