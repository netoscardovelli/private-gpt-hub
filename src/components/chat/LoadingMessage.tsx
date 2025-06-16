
import { Card } from '@/components/ui/card';
import { Loader2, FlaskConical } from 'lucide-react';

const LoadingMessage = () => {
  return (
    <div className="flex justify-start">
      <Card className="w-full max-w-[90%] sm:max-w-[80%] p-3 sm:p-4 bg-slate-800 border-slate-700">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center">
            <FlaskConical className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
            <span className="text-sm">Analisando formulação...</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoadingMessage;
