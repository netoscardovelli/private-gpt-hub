
import { FlaskConical } from 'lucide-react';
import SpecialtySelector from './SpecialtySelector';

interface ChatHeaderProps {
  user: { name: string; plan: string; dailyLimit: number; usageToday: number };
  selectedSpecialty: string;
  onSpecialtyChange: (specialty: string) => void;
}

const ChatHeader = ({ user, selectedSpecialty, onSpecialtyChange }: ChatHeaderProps) => {
  const remainingMessages = user.dailyLimit - user.usageToday;

  return (
    <div className="bg-slate-800 border-b border-slate-700 p-3 sm:p-4">
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Título e ícone */}
        <div className="flex items-center space-x-2 sm:space-x-3 text-slate-300">
          <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm">Assistente de Manipulação Farmacêutica - Plano {user.plan}</span>
        </div>
        
        {/* Área direita com seletor e contador */}
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
          
          {/* Seletor de Especialidade */}
          <div className="order-1 sm:order-1">
            <SpecialtySelector 
              selectedSpecialty={selectedSpecialty}
              onSpecialtyChange={onSpecialtyChange}
            />
          </div>
          
          {/* Contador de mensagens */}
          <div className="text-xs sm:text-sm text-slate-400 order-2 sm:order-2">
            {remainingMessages > 0 ? (
              <span>{remainingMessages} análises restantes hoje</span>
            ) : (
              <span className="text-red-400">Limite diário atingido</span>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
