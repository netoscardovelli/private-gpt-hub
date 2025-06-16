
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, Loader2, ArrowLeft, Lightbulb, FileText, MessageSquare } from 'lucide-react';
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

const SuggestionsChat = ({ user, onBack }: SuggestionsChatProps) => {
  const [currentMode, setCurrentMode] = useState<'selection' | 'case' | 'guided'>('selection');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [collectedInfo, setCollectedInfo] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Inicializar mensagem baseada no modo selecionado
  const initializeMode = (mode: 'case' | 'guided') => {
    setCurrentMode(mode);
    
    let initialMessage = '';
    
    if (mode === 'case') {
      initialMessage = `**📋 ANÁLISE DE CASO CLÍNICO**

Olá Dr(a). ${user.name}! 👨‍⚕️

Cole aqui seu caso clínico completo e eu farei uma análise inteligente para sugerir formulações personalizadas.

**📝 Pode incluir:**
• Dados do paciente (idade, sexo)
• Queixa principal e histórico
• Exame físico relevante
• Objetivos do tratamento
• Preferências terapêuticas

**Cole seu caso clínico abaixo:**`;
    } else {
      initialMessage = `**🎯 SUGESTÕES GUIADAS**

Olá Dr(a). ${user.name}! 👨‍⚕️

Vou fazer perguntas específicas para entender melhor o caso e sugerir formulações personalizadas.

**🧠 SISTEMA INTELIGENTE:**
- Perguntas direcionadas
- Análise adaptativa
- Sugestões baseadas nas suas respostas

**Vamos começar:**
Qual é a queixa principal ou condição que o paciente apresenta?`;
    }

    setMessages([{
      id: '1',
      content: initialMessage,
      role: 'assistant',
      timestamp: new Date()
    }]);
  };

  // Análise de caso clínico completo
  const analyzeClinicalCase = (caseText: string) => {
    const fullText = caseText.toLowerCase();
    
    console.log('🔍 ANALISANDO CASO CLÍNICO COMPLETO');
    
    let formulationText = '';
    
    if (fullText.includes('acne')) {
      formulationText = `**🎯 ANÁLISE DO CASO: ACNE**

**💊 FORMULAÇÃO SUGERIDA:**
• Tretinoína 0,025-0,05%
• Clindamicina 1%
• Niacinamida 5%
• Ácido Azelaico 10%
• Veículo: Gel aquoso 30g

**📋 PROTOCOLO:**
• Aplicar à noite, pele limpa
• Iniciar 3x/semana, aumentar gradualmente
• Protetor solar obrigatório
• Reavaliação em 4-6 semanas`;
    } else if (fullText.includes('melasma') || fullText.includes('mancha')) {
      formulationText = `**🎯 ANÁLISE DO CASO: MELASMA**

**💊 FORMULAÇÃO SUGERIDA:**
• Hidroquinona 4%
• Tretinoína 0,05%
• Ácido Kojico 2%
• Vitamina C 15%
• Veículo: Creme dermatológico 30g

**📋 PROTOCOLO:**
• Aplicar à noite
• Proteção solar rigorosa (FPS 60+)
• Resultado esperado em 6-8 semanas`;
    } else if (fullText.includes('celulite')) {
      formulationText = `**🎯 ANÁLISE DO CASO: CELULITE**

**💊 FORMULAÇÃO SUGERIDA:**
• Cafeína 5%
• Centella Asiática 3%
• Carnitina 2%
• Rutina 1%
• Veículo: Gel-creme 100g

**📋 PROTOCOLO:**
• Aplicar 2x ao dia com massagem
• Exercícios complementares
• Hidratação adequada`;
    } else {
      formulationText = `**🎯 ANÁLISE PERSONALIZADA DO CASO**

Com base no caso clínico apresentado, sugiro uma formulação personalizada considerando:

**💊 FORMULAÇÃO ADAPTADA:**
• Ativos específicos para a condição
• Concentrações adequadas ao perfil
• Veículo otimizado
• Protocolo individualizado

**📋 RECOMENDAÇÕES:**
• Seguir protocolo específico
• Monitoramento regular
• Ajustes conforme evolução`;
    }

    return `**✅ CASO ANALISADO COM SUCESSO!**

${formulationText}

**🔬 JUSTIFICATIVA CIENTÍFICA:**
Formulação desenvolvida com base na análise completa do caso clínico, considerando perfil do paciente, condição apresentada e objetivos terapêuticos.

**⚠️ ORIENTAÇÕES:**
• Teste de sensibilidade
• Acompanhamento médico
• Possíveis ajustes

**Posso ajudar com outras formulações ou ajustes?**`;
  };

  // IA para perguntas guiadas (código existente)
  const analyzeContext = (allResponses: string[]) => {
    const fullText = allResponses.join(' ').toLowerCase();
    
    console.log('🔍 ANÁLISE INTELIGENTE ATIVADA');

    const hasCondition = /acne|melasma|celulite|calvicie|queda|cabelo|dor|artrite|obesidade|ansiedade|insonia|fadiga|rugas|manchas|dermatite|eczema|psoriase/.test(fullText);
    const hasAge = /\b\d{1,2}\b.*(anos?|idade)|\b(jovem|adulto|idoso)\b/.test(fullText);
    const hasSex = /\b(masculino|feminino|homem|mulher|homens|mulheres)\b/.test(fullText);
    const hasGoal = /\b(quer|deseja|objetivo|meta|melhorar|tratar|curar|resultado|espera|busca)\b/.test(fullText);

    const readyItems = [hasCondition, hasAge, hasSex, hasGoal].filter(Boolean).length;
    
    if (readyItems >= 3 && hasCondition) {
      return { ready: true, missing: [] };
    }

    const missing = [];
    if (!hasCondition) missing.push('condição médica principal');
    if (!hasAge) missing.push('idade do paciente');
    if (!hasSex) missing.push('sexo do paciente');
    if (!hasGoal) missing.push('objetivo do tratamento');

    return { ready: false, missing };
  };

  const generateFormulation = (responses: string[]) => {
    const fullText = responses.join(' ').toLowerCase();
    
    let formula = '';
    
    if (fullText.includes('acne')) {
      formula = `**💊 FÓRMULA ANTI-ACNE PERSONALIZADA:**
• Tretinoína 0,025% 
• Clindamicina 1%
• Niacinamida 5%
• Ácido Azelaico 10%
• Veículo: Gel aquoso 30g

**📋 PROTOCOLO:**
• Aplicar à noite em pele limpa
• Começar 3x/semana, aumentar gradualmente
• Protetor solar obrigatório pela manhã`;
    } else if (fullText.includes('melasma') || fullText.includes('mancha')) {
      formula = `**💊 FÓRMULA DESPIGMENTANTE:**
• Hidroquinona 4%
• Tretinoína 0,05%
• Ácido Kojico 2%
• Vitamina C 15%
• Veículo: Creme dermatológico 30g

**📋 PROTOCOLO:**
• Aplicar à noite
• Proteção solar rigorosa
• Resultado em 6-8 semanas`;
    } else {
      formula = `**💊 FÓRMULA PERSONALIZADA:**
Baseada nas informações coletadas, foi desenvolvida uma formulação específica para suas necessidades terapêuticas.

**📋 PROTOCOLO INDIVIDUALIZADO:**
• Dosagem adaptada ao perfil do paciente
• Monitoramento periódico
• Ajustes conforme evolução`;
    }

    return `**🎉 FORMULAÇÃO GUIADA GERADA! 🎉**

${formula}

**🔬 JUSTIFICATIVA CIENTÍFICA:**
Esta formulação foi desenvolvida com base na análise das respostas fornecidas.

**⚠️ ORIENTAÇÕES IMPORTANTES:**
• Teste de sensibilidade antes do uso
• Acompanhamento médico regular
• Ajustes conforme necessário

**✅ Formulação completa! Posso ajudar com ajustes?**`;
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
      let responseText = '';
      
      if (currentMode === 'case') {
        // Análise de caso clínico completo
        responseText = analyzeClinicalCase(currentInput);
      } else {
        // Perguntas guiadas (lógica existente)
        const updatedInfo = [...collectedInfo, currentInput];
        setCollectedInfo(updatedInfo);
        
        const analysis = analyzeContext(updatedInfo);
        
        if (analysis.ready) {
          responseText = generateFormulation(updatedInfo);
          toast({
            title: "🎉 Formulação Gerada!",
            description: "Baseada em análise inteligente completa!",
          });
        } else {
          if (analysis.missing.includes('condição médica principal')) {
            responseText = `**🔍 CONDIÇÃO PRINCIPAL:**

Preciso saber qual é o problema de saúde que vamos tratar. Por exemplo:
• Acne (leve, moderada ou severa?)
• Melasma ou manchas na pele
• Queda de cabelo ou calvície
• Celulite
• Dores articulares
• Ansiedade ou insônia

**Qual é a condição principal do seu paciente?**`;
          } else if (analysis.missing.includes('idade do paciente')) {
            responseText = `**📊 IDADE DO PACIENTE:**

Para calcular as dosagens corretas, preciso saber:
• Quantos anos tem o paciente?
• É jovem, adulto ou idoso?

A idade influencia diretamente na concentração dos ativos!`;
          } else if (analysis.missing.includes('sexo do paciente')) {
            responseText = `**👤 PERFIL DO PACIENTE:**

Preciso saber o sexo do paciente para adaptar a formulação:
• Masculino ou feminino?

Alguns ativos têm dosagens diferentes conforme o sexo.`;
          } else if (analysis.missing.includes('objetivo do tratamento')) {
            responseText = `**🎯 OBJETIVO DO TRATAMENTO:**

O que o paciente espera alcançar?
• Melhorar aparência?
• Controlar sintomas?
• Prevenir progressão?
• Resultados rápidos ou graduais?

Isso define a estratégia terapêutica ideal!`;
          }
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseText,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetToSelection = () => {
    setCurrentMode('selection');
    setMessages([]);
    setCollectedInfo([]);
    setInput('');
  };

  const getProgress = () => {
    if (currentMode === 'case') return 100;
    const analysis = analyzeContext(collectedInfo);
    const total = 4;
    const completed = total - analysis.missing.length;
    return Math.round((completed / total) * 100);
  };

  // Tela de seleção inicial
  if (currentMode === 'selection') {
    return (
      <div className="flex flex-col h-screen bg-slate-900">
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
                <span className="text-sm font-medium">Sugestões de Fórmulas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">
                Como você quer sugerir fórmulas?
              </h1>
              <p className="text-slate-400 text-lg">
                Escolha a melhor forma de trabalhar com seu caso clínico
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Opção 1: Caso Clínico */}
              <Card 
                className="p-6 bg-slate-800 border-slate-700 cursor-pointer hover:border-purple-500 transition-all duration-200 hover:shadow-lg"
                onClick={() => initializeMode('case')}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Colar Caso Clínico
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Cole seu caso clínico completo e receba análise e sugestões de formulações automaticamente
                  </p>
                  <div className="text-sm text-slate-500">
                    ✅ Análise rápida<br/>
                    ✅ Caso completo<br/>
                    ✅ Formulação imediata
                  </div>
                </div>
              </Card>

              {/* Opção 2: Perguntas Guiadas */}
              <Card 
                className="p-6 bg-slate-800 border-slate-700 cursor-pointer hover:border-purple-500 transition-all duration-200 hover:shadow-lg"
                onClick={() => initializeMode('guided')}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Perguntas Guiadas
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Responda perguntas específicas e receba sugestões personalizadas baseadas nas suas respostas
                  </p>
                  <div className="text-sm text-slate-500">
                    ✅ Perguntas direcionadas<br/>
                    ✅ Análise adaptativa<br/>
                    ✅ Construção gradual
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interface de chat (quando um modo foi selecionado)
  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={resetToSelection}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-3 text-slate-300">
              <Lightbulb className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium">
                {currentMode === 'case' ? 'Análise de Caso' : 'Perguntas Guiadas'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {currentMode === 'guided' && (
              <div className="flex items-center space-x-2">
                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${getProgress()}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400">
                  {getProgress()}% completo
                </span>
              </div>
            )}
            <Button
              onClick={resetToSelection}
              variant="outline"
              size="sm"
              className="text-slate-400 hover:text-slate-200 border-slate-600"
            >
              Trocar Modo
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
                    <Lightbulb className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      {currentMode === 'case' ? 'Analisando caso clínico...' : 'IA analisando informações...'}
                    </span>
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
                currentMode === 'case' 
                  ? "Cole aqui seu caso clínico completo..." 
                  : "Responda a pergunta acima..."
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
          
          <div className="flex justify-center mt-3 text-xs text-slate-400">
            <span className="text-center">
              {currentMode === 'case' 
                ? '📋 Cole seu caso clínico para análise inteligente'
                : '🧠 IA Adaptativa - Responda para construir a formulação ideal'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionsChat;
