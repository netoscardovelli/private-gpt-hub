
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDoctorRegistration } from '@/hooks/useDoctorRegistration';
import { useValidateInvitation } from '@/hooks/useValidateInvitation';

const DoctorRegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const { toast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    crm: '',
    specialty: ''
  });

  const { registerDoctor, isRegistering } = useDoctorRegistration();
  const { invitation, isLoading: validatingInvitation, error: invitationError, validateInvitation } = useValidateInvitation();

  const specialties = [
    'Medicina Geral',
    'Cardiologia',
    'Dermatologia',
    'Endocrinologia',
    'Ginecologia',
    'Neurologia',
    'Ortopedia',
    'Pediatria',
    'Psiquiatria',
    'Urologia',
    'Outras'
  ];

  useEffect(() => {
    if (token) {
      validateInvitation(token);
    }
  }, [token, validateInvitation]);

  // Pré-preencher email quando convite for carregado
  useEffect(() => {
    if (invitation && !formData.email) {
      setFormData(prev => ({ ...prev, email: invitation.email }));
    }
  }, [invitation, formData.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({
        title: "Erro",
        description: "Token de convite não encontrado",
        variant: "destructive"
      });
      return;
    }

    if (!invitation) {
      toast({
        title: "Erro",
        description: "Convite não validado. Recarregue a página.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    if (formData.email !== invitation.email) {
      toast({
        title: "Erro",
        description: "Email deve ser o mesmo do convite",
        variant: "destructive"
      });
      return;
    }

    try {
      await registerDoctor({
        token,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        crm: formData.crm,
        specialty: formData.specialty
      });

      toast({
        title: "Conta criada com sucesso!",
        description: "Você pode fazer login agora com suas credenciais."
      });

      navigate('/auth?message=Conta criada com sucesso. Faça login para continuar.');
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro ao criar conta. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Token Inválido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              Token de convite não encontrado no link.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (validatingInvitation) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-white">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Validando convite...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitationError || !invitation) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Convite Inválido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              {invitationError || 'Este convite não é válido ou já expirou.'}
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <UserPlus className="w-5 h-5" />
            Cadastro de Médico
          </CardTitle>
          <CardDescription>
            Complete seu cadastro para {invitation.organization?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="seu@email.com"
                disabled={!!invitation.email}
                required
              />
              {invitation.email && (
                <p className="text-xs text-slate-500">
                  Email do convite (não pode ser alterado)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="crm">CRM *</Label>
              <Input
                id="crm"
                type="text"
                value={formData.crm}
                onChange={(e) => setFormData(prev => ({ ...prev, crm: e.target.value }))}
                placeholder="Ex: 12345/SP"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidade *</Label>
              <Select 
                value={formData.specialty} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, specialty: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Digite a senha novamente"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isRegistering}>
              {isRegistering ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar Conta
                </>
              )}
            </Button>

            <Button 
              type="button"
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              Cancelar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorRegisterPage;
