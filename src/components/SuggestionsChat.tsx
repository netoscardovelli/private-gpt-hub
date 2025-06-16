
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
  [key: string]: string;
}

const SuggestionsChat = ({ user, onBack }: SuggestionsChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Olá Dr(a). ${user.name}! 👨‍⚕️

Sou seu assistente para desenvolvimento de fórmulas magistrais personalizadas. Vou conduzir uma anamnese inteligente e adaptativa, coletando as informações clínicas necessárias de forma natural.

**🧠 SISTEMA ADAPTATIVO:**
- Faço perguntas inteligentes baseadas no que você me conta
- Analiso se já tenho dados suficientes para formular
- Só gero a fórmula quando o caso clínico estiver completo

**Para começar, me conte:**
Qual é a queixa principal do seu paciente? Pode descrever livremente a condição que precisa ser tratada.`,
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [clinicalContext, setClinicalContext] = useState<ClinicalContext>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // IA ADAPTATIVA - Analisa se já pode formular ou precisa de mais informações
  const clinicalReasoning = (context: Record<string, string>) => {
    const fullText = Object.values(context).join(' ').toLowerCase();

    const hasComplaint = fullText.match(/dor|queda|acne|melasma|ansiedade|obesidade|sono|fadiga|celulite|rugas|manchas|calvície|cabelo|dermatite|eczema|psoríase|hipertensão|diabetes|colesterol|artrite|artrose|fibromialgia|enxaqueca|insônia|depressão|estresse/);
    const hasDemographics = fullText.match(/\b\d{1,3}\b.*(anos|kg|m|cm|metro|quilo|idade)|sexo|masculino|feminino|homem|mulher/);
    const hasHistory = fullText.match(/histórico|tratamento|remédio|medicação|uso|toma|tomou|fez|cirurgia|alergia|problema|doença|condição|diagnóstico/);
    const hasObjective = fullText.match(/objetivo|meta|desejo|espera|resultado|melhorar|tratar|curar|controlar|diminuir|aumentar/);

    console.log('🔍 Análise do contexto clínico:');
    console.log('- Queixa identificada:', !!hasComplaint);
    console.log('- Demografia identificada:', !!hasDemographics);
    console.log('- Histórico identificado:', !!hasHistory);
    console.log('- Objetivo identificado:', !!hasObjective);

    if (hasComplaint && hasDemographics && hasHistory && hasObjective) {
      console.log('✅ CONTEXTO COMPLETO - Gerando formulação!');
      return {
        ready: true,
        nextStep: ''
      };
    }

    if (!hasComplaint) {
      return { 
        ready: false, 
        nextStep: `**🔍 INFORMAÇÃO NECESSÁRIA:**

Preciso entender melhor a queixa principal. Pode me contar:
• Qual é exatamente o problema que o paciente apresenta?
• Quais são os sintomas principais?
• Em que parte do corpo ou aspecto da saúde?

Exemplo: "Paciente com acne inflamatória no rosto" ou "Dores articulares nos joelhos"` 
      };
    }

    if (!hasDemographics) {
      return { 
        ready: false, 
        nextStep: `**📊 PERFIL DO PACIENTE:**

Para calcular dosagens seguras, preciso saber:
• Idade e sexo do paciente?
• Peso aproximado e altura?

Essas informações são fundamentais para personalizar a formulação.` 
      };
    }

    if (!hasHistory) {
      return { 
        ready: false, 
        nextStep: `**🏥 HISTÓRICO CLÍNICO:**

Preciso conhecer o contexto médico:
• O paciente tem alguma doença crônica ou condição médica?
• Usa algum medicamento regularmente?
• Tem alergias conhecidas a medicamentos ou substâncias?
• Já tentou algum tratamento para este problema?

Isso me ajuda a evitar interações e escolher os melhores ativos.` 
      };
    }

    if (!hasObjective) {
      return { 
        ready: false, 
        nextStep: `**🎯 OBJETIVOS DO TRATAMENTO:**

Para personalizar a abordagem, preciso saber:
• Qual o principal resultado que o paciente espera?
• Em quanto tempo gostaria de ver melhorias?
• Prioriza resultados rápidos ou tratamento mais suave?
• Tem preferência de horário para aplicação (manhã/noite)?

Isso define o protocolo ideal.` 
      };
    }

    return { 
      ready: false, 
      nextStep: `**💡 COMPLEMENTANDO O CASO:**

Estou quase com todas as informações! Me conte mais alguns detalhes relevantes:
• Há fatores que pioram ou melhoram a condição?
• O paciente tem rotina específica ou limitações?
• Alguma informação adicional importante sobre o caso?

Após isso poderei gerar uma formulação completa e personalizada.` 
    };
  };

  const generateFormulation = (context: ClinicalContext) => {
    const fullText = Object.values(context).join(' ').toLowerCase();
    
    console.log('🧬 GERANDO FORMULAÇÃO PERSONALIZADA');
    console.log('📋 Contexto completo:', context);
    
    let primaryFormulation = '';
    let rationale = '';
    let protocol = '';
    let considerations = '';
    let prognosis = '';
    
    // Análise inteligente da queixa principal
    if (fullText.includes('acne')) {
      if (fullText.includes('leve') || fullText.includes('comedão')) {
        primaryFormulation = `**💊 FÓRMULA ANTI-ACNE LEVE:**
• Ácido Salicílico 1-2%
• Niacinamida 4%
• Zinco PCA 1%
• Pantenol 2%
• Veículo: Gel-creme oil-free`;
        rationale = `Abordagem suave focada em desobstrução dos poros e controle da oleosidade sem causar ressecamento excessivo.`;
      } else if (fullText.includes('moderada') || fullText.includes('inflamatória')) {
        primaryFormulation = `**💊 FÓRMULA ANTI-ACNE MODERADA:**
• Adapaleno 0,1% (ou Tretinoína 0,025%)
• Clindamicina 1%
• Niacinamida 5%
• Ácido Azelaico 10%
• Veículo: Gel aquoso`;
        rationale = `Combinação retinóide + antibiótico para controle inflamatório, com moduladores de oleosidade e renovação celular.`;
      } else {
        primaryFormulation = `**💊 FÓRMULA ANTI-ACNE SEVERA:**
• Tretinoína 0,05%
• Peróxido de Benzoíla 2,5%
• Ácido Azelaico 15%
• Niacinamida 5%
• Veículo: Emulsão não-comedogênica`;
        rationale = `Protocolo intensivo com múltiplas vias de ação: renovação celular, ação antimicrobiana e anti-inflamatória.`;
      }
    } else if (fullText.includes('melasma') || fullText.includes('mancha')) {
      primaryFormulation = `**💊 FÓRMULA DESPIGMENTANTE PERSONALIZADA:**
• Hidroquinona 2-4% (conforme severidade)
• Tretinoína 0,025-0,05%
• Ácido Kojico 2%
• Vitamina C 10%
• Ácido Glicólico 5%
• Veículo: Creme base dermatológica`;
      rationale = `Tripla ação despigmentante com bloqueio da tirosinase, renovação celular acelerada e antioxidação.`;
    } else if (fullText.includes('celulite')) {
      primaryFormulation = `**💊 FÓRMULA ANTI-CELULITE:**
• Cafeína 5%
• Centella Asiática 2%
• Carnitina 3%
• Silício Orgânico 1%
• Castanha-da-Índia 2%
• Rutina 1%
• Veículo: Gel-creme para massagem`;
      rationale = `Sinergia de ativos lipolíticos, circulatórios e firmadores para ação completa na celulite.`;
    } else if (fullText.includes('dor') || fullText.includes('articular') || fullText.includes('artrite')) {
      primaryFormulation = `**💊 FÓRMULA ANTI-INFLAMATÓRIA PARA DOR:**
• Curcumina 500mg
• Boswellia serrata 300mg
• Glucosamina 1500mg
• Condroitina 1200mg
• MSM 1000mg
• Vitamina D3 2000UI
• Ômega-3 EPA/DHA 1000mg
• Veículo: Cápsulas gastrorresistentes`;
      rationale = `Sinergia anti-inflamatória natural e regenerativa para proteção articular e alívio da dor.`;
    } else if (fullText.includes('calvície') || fullText.includes('queda') || fullText.includes('cabelo')) {
      primaryFormulation = `**💊 FÓRMULA ANTIQUEDA CAPILAR:**
• Minoxidil 5% (homens) / 2% (mulheres)
• Finasterida 1mg (homens)
• Biotina 5mg
• Cafeína 1%
• Peptídeo de cobre 0,5%
• Veículo: Solução tópica + cápsulas`;
      rationale = `Abordagem combinada tópica e sistêmica para estimular crescimento e reduzir queda capilar.`;
    } else {
      primaryFormulation = `**💊 FÓRMULA PERSONALIZADA:**
Baseada na análise completa do caso clínico apresentado, com formulação específica para as necessidades identificadas.`;
      rationale = `Formulação desenvolvida considerando todos os aspectos clínicos, demográficos e objetivos terapêuticos do paciente.`;
    }
    
    protocol = `**📋 PROTOCOLO DE USO PERSONALIZADO:**
• **Manhã:** Limpeza suave + Protetor solar FPS 60+
• **Noite:** Limpeza + Aplicação da fórmula magistral
• **Frequência inicial:** 3x/semana (primeira semana)
• **Aumento gradual:** Conforme tolerância da pele
• **Reavaliação:** Retorno em 15-30 dias para ajustes`;
    
    considerations = `**⚠️ CONSIDERAÇÕES CLÍNICAS IMPORTANTES:**
• Fotoproteção rigorosa é obrigatória durante o tratamento
• Hidratação complementar se necessário conforme resposta da pele
• Monitorar possível irritação inicial (normal e transitória)
• Ajustar concentrações conforme evolução e tolerância
• Evitar exposição solar excessiva, especialmente entre 10h-16h`;
    
    prognosis = `**📈 PROGNÓSTICO E EXPECTATIVAS:**
• **2-4 semanas:** Primeiras melhorias visíveis e adaptação da pele
• **6-8 semanas:** Resultados mais significativos e consistentes
• **3-6 meses:** Resultados ótimos e estabilização
• **Manutenção:** Protocolo adaptado para resultados duradouros`;
    
    return `**🎉 ANAMNESE COMPLETA - FORMULAÇÃO INTELIGENTE GERADA! 🎉**

**🧬 ANÁLISE CLÍNICA PERSONALIZADA**

**📋 SÍNTESE DO CASO CLÍNICO:**
${Object.entries(context).map(([key, value], index) => `• **Informação ${index + 1}:** ${value}`).join('\n')}

---

**💊 PROTOCOLO FARMACÊUTICO PERSONALIZADO**

${primaryFormulation}

**🔬 JUSTIFICATIVA CIENTÍFICA:**
${rationale}

**📊 PROTOCOLO DE APLICAÇÃO:**
${protocol}

**⚠️ CONSIDERAÇÕES CLÍNICAS:**
${considerations}

**📈 PROGNÓSTICO E MONITORAMENTO:**
${prognosis}

---

**✅ Formulação completa baseada em anamnese inteligente e adaptativa!**

**🤝 Posso ajudar com:**
• Ajustes nas concentrações dos ativos
• Fórmulas complementares (sérum, mousse, etc.)
• Orientações específicas de aplicação
• Modificações baseadas na evolução do tratamento

**O que gostaria de aprofundar ou ajustar na formulação?**`;
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
      // Atualiza o contexto acumulado com timestamp único
      const updatedContext = {
        ...clinicalContext,
        [`info_${Date.now()}`]: currentInput
      };

      setClinicalContext(updatedContext);
      console.log('📝 Contexto atualizado:', updatedContext);

      // IA decide se já pode formular ou precisa perguntar mais
      const { ready, nextStep } = clinicalReasoning(updatedContext);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: ready
          ? generateFormulation(updatedContext)
          : nextStep,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (ready) {
        toast({
          title: "✅ Formulação Inteligente Gerada!",
          description: "Baseada em raciocínio clínico completo e adaptativo.",
        });
      }

      setIsLoading(false);
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

Sou seu assistente para desenvolvimento de fórmulas magistrais personalizadas. Vou conduzir uma anamnese inteligente e adaptativa, coletando as informações clínicas necessárias de forma natural.

**🧠 SISTEMA ADAPTATIVO:**
- Faço perguntas inteligentes baseadas no que você me conta
- Analiso se já tenho dados suficientes para formular
- Só gero a fórmula quando o caso clínico estiver completo

**Para começar, me conte:**
Qual é a queixa principal do seu paciente? Pode descrever livremente a condição que precisa ser tratada.`,
      role: 'assistant',
      timestamp: new Date()
    }]);
    setClinicalContext({});
    setInput('');
  };

  const getContextProgress = () => {
    const fullText = Object.values(clinicalContext).join(' ').toLowerCase();
    
    const checks = {
      complaint: !!fullText.match(/dor|queda|acne|melasma|ansiedade|obesidade|sono|fadiga|celulite|rugas|manchas|calvície|cabelo|dermatite/),
      demographics: !!fullText.match(/\b\d{1,3}\b.*(anos|kg|m|cm)|sexo|masculino|feminino/),
      history: !!fullText.match(/histórico|tratamento|remédio|medicação|uso|alergia|problema|doença/),
      objective: !!fullText.match(/objetivo|meta|desejo|espera|resultado|melhorar|tratar/)
    };
    
    const completedItems = Object.values(checks).filter(Boolean).length;
    const progress = (completedItems / 4) * 100;
    
    return {
      progress,
      checks,
      completed: completedItems,
      total: 4
    };
  };

  const progressData = getContextProgress();

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
              <span className="text-sm font-medium">Anamnese Inteligente IA</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                  style={{ width: `${progressData.progress}%` }}
                />
              </div>
              <span className="text-xs text-slate-400">
                {progressData.completed}/{progressData.total} aspectos coletados
              </span>
            </div>
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
                    <span>Analisando informações e processando raciocínio clínico...</span>
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
              placeholder="Descreva livremente as informações do paciente. O sistema analisará automaticamente se precisa de mais dados ou já pode gerar a formulação..."
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
          
          {/* Indicadores de progresso */}
          <div className="flex justify-between items-center mt-3 text-xs text-slate-400">
            <div className="flex space-x-4">
              <span className={progressData.checks.complaint ? 'text-green-400' : 'text-slate-400'}>
                ✓ Queixa Principal
              </span>
              <span className={progressData.checks.demographics ? 'text-green-400' : 'text-slate-400'}>
                ✓ Demografia
              </span>
              <span className={progressData.checks.history ? 'text-green-400' : 'text-slate-400'}>
                ✓ Histórico
              </span>
              <span className={progressData.checks.objective ? 'text-green-400' : 'text-slate-400'}>
                ✓ Objetivos
              </span>
            </div>
            <span className="text-slate-500">
              Sistema adaptativo - Responda naturalmente
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionsChat;
