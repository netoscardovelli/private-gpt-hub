
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
  age: string;
  gender: string;
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

Sou seu assistente para desenvolvimento de fórmulas magistrais personalizadas. Vou te ajudar a criar formulações específicas através de uma anamnese estruturada.

Vamos começar com algumas perguntas sobre seu paciente para desenvolver a melhor formulação possível:

**1. Qual é a queixa principal do paciente?**
(Ex: acne, melasma, queda capilar, dor articular, ansiedade, etc.)`,
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
      question: "**1. Qual é a queixa principal do paciente?**\n(Ex: acne, melasma, queda capilar, dor articular, ansiedade, etc.)",
      field: 'complaint'
    },
    {
      step: 2,
      question: "**2. Idade e sexo do paciente?**\n(Ex: 35 anos, feminino)",
      field: 'age'
    },
    {
      step: 3,
      question: "**3. Histórico médico relevante?**\n(Comorbidades, cirurgias prévias, condições crônicas)",
      field: 'medicalHistory'
    },
    {
      step: 4,
      question: "**4. Medicações em uso atualmente?**\n(Incluir suplementos e fitoterápicos)",
      field: 'currentMedications'
    },
    {
      step: 5,
      question: "**5. Alergias ou intolerâncias conhecidas?**\n(Medicamentosas, alimentares, cosméticas)",
      field: 'allergies'
    },
    {
      step: 6,
      question: "**6. Estilo de vida do paciente?**\n(Atividade física, estresse, sono, dieta)",
      field: 'lifestyle'
    },
    {
      step: 7,
      question: "**7. Objetivos terapêuticos específicos?**\n(Resultados esperados, prazo desejado)",
      field: 'objectives'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateFormulationSuggestion = (data: Partial<ClinicalData>) => {
    const responses = [
      `**ANÁLISE CLÍNICA COMPLETA**

Baseado nos dados coletados, desenvolvi uma proposta de formulação personalizada:

**📋 RESUMO DO CASO:**
- Paciente: ${data.age || 'Idade não informada'}
- Queixa: ${data.complaint || 'Não especificada'}
- Objetivos: ${data.objectives || 'Não especificados'}

**💊 SUGESTÃO DE FORMULAÇÃO:**

*Considerando o perfil clínico apresentado, sugiro uma abordagem multimodal com as seguintes opções:*

**Fórmula Principal:**
- [Ativos específicos baseados na queixa]
- [Concentrações adequadas ao perfil]
- [Forma farmacêutica otimizada]

**Fórmulas Complementares:**
- [Suporte nutricional específico]
- [Antioxidantes personalizados]
- [Moduladores específicos]

**⚠️ CONSIDERAÇÕES IMPORTANTES:**
- Interações com medicações atuais: ${data.currentMedications || 'Não informadas'}
- Contraindicações por alergias: ${data.allergies || 'Não informadas'}
- Ajustes por estilo de vida: ${data.lifestyle || 'Não informado'}

**📅 PROTOCOLO SUGERIDO:**
- Início gradual para avaliar tolerância
- Monitoramento clínico em 15-30 dias
- Ajustes conforme resposta terapêutica

Gostaria que eu detalhe alguma formulação específica ou tem alguma preferência de ativos?`,

      `**PROPOSTA TERAPÊUTICA PERSONALIZADA**

Com base na anamnese realizada, elaborei um protocolo farmacêutico direcionado:

**🎯 ESTRATÉGIA TERAPÊUTICA:**
Para: ${data.complaint || 'Condição não especificada'}
Paciente: ${data.age || 'Perfil não definido'}

**💡 FORMULAÇÕES SUGERIDAS:**

**1. Fórmula Base Personalizada:**
[Combinação sinérgica de ativos específicos para a condição]

**2. Suporte Sistêmico:**
[Nutrientes e cofatores para otimizar a resposta]

**3. Proteção e Prevenção:**
[Antioxidantes e protetores específicos]

**🔍 CONSIDERAÇÕES CLÍNICAS:**
- Histórico: ${data.medicalHistory || 'Não relatado'}
- Medicações: ${data.currentMedications || 'Não informadas'}
- Restrições: ${data.allergies || 'Nenhuma informada'}

**📈 EXPECTATIVAS DE RESULTADOS:**
Baseado no objetivo: ${data.objectives || 'Não especificado'}

Posso detalhar a composição completa de qualquer uma dessas formulações. Qual seria sua preferência?`
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
        
        assistantResponse = `Perfeito! Anotado: "${currentInput}"

${nextQuestion?.question || ''}`;
        
        setCurrentStep(nextStep);
      } else {
        // Gerar sugestão de formulação
        const updatedData = {
          ...clinicalData,
          [currentQuestion?.field || '']: currentInput
        };
        
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
          title: "Anamnese completa!",
          description: "Formulação personalizada gerada com base nos dados clínicos.",
        });
      }
    }, 1500);
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

Sou seu assistente para desenvolvimento de fórmulas magistrais personalizadas. Vou te ajudar a criar formulações específicas através de uma anamnese estruturada.

Vamos começar com algumas perguntas sobre seu paciente para desenvolver a melhor formulação possível:

**1. Qual é a queixa principal do paciente?**
(Ex: acne, melasma, queda capilar, dor articular, ansiedade, etc.)`,
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
              <span className="text-sm font-medium">Desenvolvimento de Fórmulas Magistrais</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-400">
              Passo {Math.min(currentStep, clinicalQuestions.length)} de {clinicalQuestions.length}
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
                    <span>Analisando dados clínicos...</span>
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
                  ? "Descreva detalhadamente..."
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
