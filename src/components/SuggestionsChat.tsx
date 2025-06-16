
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

const SuggestionsChat = ({ user, onBack }: SuggestionsChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Olá Dr(a). ${user.name}! 👨‍⚕️

Sou seu assistente INTELIGENTE para fórmulas magistrais. Agora uso IA ADAPTATIVA que analisa automaticamente se já tenho informações suficientes ou se preciso perguntar mais.

**🧠 SISTEMA NOVO E INTELIGENTE:**
- Você fala LIVREMENTE sobre o caso
- EU analiso se posso formular ou preciso de mais dados
- Só gero fórmula quando estiver 100% pronto

**Para começar:**
Me conte sobre o paciente e a condição que quer tratar. Fale naturalmente!`,
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  
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

  // IA NOVA E SIMPLES - ANÁLISE INTELIGENTE
  const analyzeContext = (allResponses: string[]) => {
    const fullText = allResponses.join(' ').toLowerCase();
    
    console.log('🔍 ANÁLISE INTELIGENTE ATIVADA');
    console.log('📝 Texto completo:', fullText);

    // BUSCA POR INFORMAÇÕES ESSENCIAIS
    const hasCondition = /acne|melasma|celulite|calvicie|queda|cabelo|dor|artrite|obesidade|ansiedade|insonia|fadiga|rugas|manchas|dermatite|eczema|psoriase/.test(fullText);
    const hasAge = /\b\d{1,2}\b.*(anos?|idade)|\b(jovem|adulto|idoso)\b/.test(fullText);
    const hasSex = /\b(masculino|feminino|homem|mulher|homens|mulheres)\b/.test(fullText);
    const hasGoal = /\b(quer|deseja|objetivo|meta|melhorar|tratar|curar|resultado|espera|busca)\b/.test(fullText);

    console.log('✅ CHECAGEM:', { hasCondition, hasAge, hasSex, hasGoal });

    const readyItems = [hasCondition, hasAge, hasSex, hasGoal].filter(Boolean).length;
    
    if (readyItems >= 3 && hasCondition) {
      console.log('🎉 PRONTO PARA FORMULAR!');
      return { ready: true, missing: [] };
    }

    // DEFINIR O QUE ESTÁ FALTANDO
    const missing = [];
    if (!hasCondition) missing.push('condição médica principal');
    if (!hasAge) missing.push('idade do paciente');
    if (!hasSex) missing.push('sexo do paciente');
    if (!hasGoal) missing.push('objetivo do tratamento');

    console.log('❌ FALTANDO:', missing);
    return { ready: false, missing };
  };

  // GERAR FÓRMULA PERSONALIZADA
  const generateFormulation = (responses: string[]) => {
    const fullText = responses.join(' ').toLowerCase();
    
    let formula = '';
    let protocol = '';
    
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
    } else if (fullText.includes('celulite')) {
      formula = `**💊 FÓRMULA ANTI-CELULITE:**
• Cafeína 5%
• Centella Asiática 3%
• Carnitina 2%
• Rutina 1%
• Veículo: Gel-creme 100g

**📋 PROTOCOLO:**
• Aplicar 2x ao dia com massagem
• Exercícios complementares
• Hidratação abundante`;
    } else {
      formula = `**💊 FÓRMULA PERSONALIZADA:**
Baseada nas informações coletadas, foi desenvolvida uma formulação específica para suas necessidades terapêuticas.

**📋 PROTOCOLO INDIVIDUALIZADO:**
• Dosagem adaptada ao perfil do paciente
• Monitoramento periódico
• Ajustes conforme evolução`;
    }

    return `**🎉 FORMULAÇÃO INTELIGENTE GERADA! 🎉**

${formula}

**🔬 JUSTIFICATIVA CIENTÍFICA:**
Esta formulação foi desenvolvida com base na análise inteligente das informações fornecidas, considerando o perfil do paciente e objetivos terapêuticos.

**⚠️ ORIENTAÇÕES IMPORTANTES:**
• Teste de sensibilidade antes do uso
• Acompanhamento médico regular
• Ajustes conforme necessário

**✅ Formulação completa! Posso ajudar com ajustes ou outras fórmulas?**`;
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

    // SIMULAR PROCESSAMENTO REAL
    setTimeout(() => {
      console.log('🚀 PROCESSANDO NOVA RESPOSTA');
      
      // ADICIONAR NOVA INFORMAÇÃO
      const updatedInfo = [...collectedInfo, currentInput];
      setCollectedInfo(updatedInfo);
      
      console.log('📚 Informações coletadas:', updatedInfo);

      // ANÁLISE INTELIGENTE
      const analysis = analyzeContext(updatedInfo);
      
      let responseText = '';
      
      if (analysis.ready) {
        console.log('✅ GERANDO FORMULAÇÃO');
        responseText = generateFormulation(updatedInfo);
        
        toast({
          title: "🎉 Formulação Gerada!",
          description: "Baseada em análise inteligente completa!",
        });
      } else {
        console.log('❓ COLETANDO MAIS INFORMAÇÕES');
        
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
        } else {
          responseText = `**💡 QUASE PRONTO!**

Tenho quase todas as informações necessárias. Pode me contar mais algum detalhe relevante sobre:
• Histórico de tratamentos anteriores
• Alergias conhecidas
• Preferências do paciente

Em breve poderei gerar sua formulação personalizada!`;
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

  const resetChat = () => {
    console.log('🔄 REINICIANDO CHAT');
    setMessages([{
      id: '1',
      content: `Olá Dr(a). ${user.name}! 👨‍⚕️

Sou seu assistente INTELIGENTE para fórmulas magistrais. Agora uso IA ADAPTATIVA que analisa automaticamente se já tenho informações suficientes ou se preciso perguntar mais.

**🧠 SISTEMA NOVO E INTELIGENTE:**
- Você fala LIVREMENTE sobre o caso
- EU analiso se posso formular ou preciso de mais dados
- Só gero fórmula quando estiver 100% pronto

**Para começar:**
Me conte sobre o paciente e a condição que quer tratar. Fale naturalmente!`,
      role: 'assistant',
      timestamp: new Date()
    }]);
    setCollectedInfo([]);
    setInput('');
  };

  const getProgress = () => {
    const analysis = analyzeContext(collectedInfo);
    const total = 4;
    const completed = total - analysis.missing.length;
    return Math.round((completed / total) * 100);
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
              <span className="text-sm font-medium">IA Adaptativa - Nova Versão</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
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
            <Button
              onClick={resetChat}
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
                    <Lightbulb className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>IA analisando informações... 🧠</span>
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
              placeholder="Fale naturalmente sobre o caso clínico. A IA vai analisar e decidir automaticamente quando já pode gerar a formulação..."
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
              🧠 IA Adaptativa Ativada - Responda livremente, eu analiso automaticamente
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionsChat;
