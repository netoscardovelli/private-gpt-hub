
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Send, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackPanelProps {
  onSubmit: (rating: number, feedback: string) => Promise<void>;
  onCancel: () => void;
}

const FeedbackPanel = ({ onSubmit, onCancel }: FeedbackPanelProps) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Feedback obrigatório",
        description: "Por favor, descreva suas sugestões de melhoria.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(rating, feedback);
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      toast({
        title: "Erro ao enviar feedback",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mt-3 p-4 bg-slate-700 border-slate-600">
      <h3 className="text-sm font-semibold text-white mb-3">
        💡 Ensine o sistema sobre suas preferências
      </h3>
      
      <div className="space-y-3">
        {/* Rating com estrelas */}
        <div>
          <label className="text-xs text-slate-300 mb-2 block">
            Como você avalia esta análise?
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                variant="ghost"
                size="sm"
                onClick={() => setRating(star)}
                className={`p-1 h-8 w-8 ${
                  star <= rating ? 'text-yellow-400' : 'text-slate-400'
                }`}
              >
                <Star className="w-4 h-4" fill={star <= rating ? 'currentColor' : 'none'} />
              </Button>
            ))}
          </div>
        </div>

        {/* Feedback textual */}
        <div>
          <label className="text-xs text-slate-300 mb-2 block">
            Como podemos melhorar? (sugestões de ativos, concentrações, estilo de análise, etc.)
          </label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Ex: Prefiro análises mais focadas em mecanismo de ação, gosto de usar concentrações mais conservadoras, sempre inclua fórmulas preventivas..."
            className="bg-slate-600 border-slate-500 text-white placeholder-slate-400 text-sm"
            rows={3}
          />
        </div>

        {/* Botões */}
        <div className="flex space-x-2">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !feedback.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            size="sm"
          >
            <Send className="w-3 h-3 mr-1" />
            {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-slate-500 text-slate-300 hover:text-slate-100 text-xs"
            size="sm"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FeedbackPanel;
