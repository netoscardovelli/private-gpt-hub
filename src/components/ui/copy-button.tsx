
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  label?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
  showIcon?: boolean;
}

const CopyButton = ({ 
  text, 
  label = "Copiar", 
  variant = "ghost", 
  size = "sm",
  className,
  showIcon = true 
}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copiado!",
        description: `${label} copiado para a área de transferência.`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={copyToClipboard}
      className={cn("gap-2", className)}
    >
      {showIcon && (copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />)}
      {copied ? "Copiado!" : label}
    </Button>
  );
};

export default CopyButton;
