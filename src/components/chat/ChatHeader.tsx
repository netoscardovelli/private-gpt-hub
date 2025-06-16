
import { FlaskConical } from 'lucide-react';

interface ChatHeaderProps {
  user: { name: string; plan: string; dailyLimit: number; usageToday: number };
}

const ChatHeader = ({ user }: ChatHeaderProps) => {
  const remainingMessages = user.dailyLimit - user.usageToday;

  return (
    <div className="bg-slate-800 border-b border-slate-700 p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-2 sm:space-x-3 text-slate-300">
          <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm">Assistente de Manipulação Farmacêutica - Plano {user.plan}</span>
        </div>
        <div className="text-xs sm:text-sm text-slate-400">
          {remainingMessages > 0 ? (
            <span>{remainingMessages} análises restantes hoje</span>
          ) : (
            <span className="text-red-400">Limite diário atingido</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
