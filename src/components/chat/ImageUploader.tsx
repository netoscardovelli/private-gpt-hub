
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploaderProps {
  onImageExtracted: (text: string, imageUrl: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ImageUploader = ({ onImageExtracted, isLoading, setIsLoading }: ImageUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem",
        variant: "destructive"
      });
      return;
    }

    // Convert image to base64 for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      // Call the OCR edge function
      const { data, error } = await supabase.functions.invoke('ocr-analysis', {
        body: formData
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Erro ao processar imagem');
      }

      const extractedText = data.extractedText;
      const imageUrl = URL.createObjectURL(file);
      
      onImageExtracted(extractedText, imageUrl);

      toast({
        title: "Imagem processada!",
        description: "Texto extraído com sucesso da imagem",
      });
    } catch (error: any) {
      console.error('Erro no OCR:', error);
      toast({
        title: "Erro no processamento",
        description: error.message || "Não foi possível extrair texto da imagem",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="space-y-2">
      {selectedImage && (
        <div className="relative inline-block">
          <img 
            src={selectedImage} 
            alt="Imagem selecionada" 
            className="max-w-32 max-h-32 rounded-lg border border-slate-600"
          />
          <Button
            onClick={clearImage}
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          dragActive 
            ? 'border-emerald-500 bg-emerald-50/10' 
            : 'border-slate-600 hover:border-slate-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          id="image-upload"
          disabled={isLoading}
        />
        
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="flex flex-col items-center space-y-2">
            {isLoading ? (
              <Upload className="w-6 h-6 text-slate-400 animate-spin" />
            ) : (
              <ImageIcon className="w-6 h-6 text-slate-400" />
            )}
            <p className="text-sm text-slate-400">
              {isLoading ? 'Processando imagem...' : 'Clique ou arraste uma imagem para extrair texto'}
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default ImageUploader;
