
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, RotateCcw } from 'lucide-react';
import { useEffect, useRef } from 'react';
import SpecialtySelector from './SpecialtySelector';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onReset: () => void;
  isLoading: boolean;
  remainingMessages: number;
  placeholder?: string;
  selectedSpecialty: string;
  onSpecialtyChange: (specialty: string) => void;
}

const ChatInput = ({ 
  input, 
  setInput, 
  onSend, 
  onReset, 
  isLoading, 
  remainingMessages,
  placeholder = "Cole suas fórmulas para análise...",
  selectedSpecialty,
  onSpecialtyChange
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleInputFocus = () => {
    // Se o input contém o texto padrão, limpa quando o usuário focar
    if (input === 'Quero fazer análise de fórmulas magistrais') {
      setInput('');
    }
  };

  return (
    <div className="border-t border-slate-700 p-2 sm:p-4 bg-slate-800">
      <div className="flex space-x-2 sm:space-x-4 items-end">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-none text-sm sm:text-base min-h-[40px] max-h-[200px] overflow-y-auto"
          rows={1}
          disabled={remainingMessages <= 0}
        />
        <Button 
          onClick={onReset}
          variant="outline"
          className="border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-500 h-10 w-10 p-0 flex-shrink-0"
          title="Resetar conversa"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button 
          onClick={onSend}
          disabled={!input.trim() || isLoading || remainingMessages <= 0}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 h-10 w-10 p-0 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Seletor de Especialidade */}
      <div className="flex justify-between items-center mt-3">
        <SpecialtySelector 
          selectedSpecialty={selectedSpecialty}
          onSpecialtyChange={onSpecialtyChange}
        />
        
        {remainingMessages <= 0 && (
          <p className="text-xs sm:text-sm text-red-400">
            Limite diário atingido. Faça upgrade do seu plano para continuar analisando formulações.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
