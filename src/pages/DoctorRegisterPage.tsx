
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Loader2, Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useValidateInvitation } from '@/hooks/useValidateInvitation';
import { useDoctorRegistration } from '@/hooks/useDoctorRegistration';

const DoctorRegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get('token');
  
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
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const { 
    invitation, 
    isLoading: validatingInvitation, 
    error: invitationError, 
    validateInvitation,
    retry: retryValidation 
  } = useValidateInvitation();
  
  const { registerDoctor, isRegistering } = useDoctorRegistration();

  // Validação do token ao carregar a página
  useEffect(() => {
    console.log('🚀 DoctorRegisterPage carregada');
    console.log('🔗 Token da URL:', token);
    
    if (!token) {
      console.error('❌ Token não encontrado na URL');
      toast({
        title: 'Link Inválido',
        description: 'Token de convite não encontrado na URL',
        variant: 'destructive'
      });
      navigate('/doctors/accept-invitation');
      return;
    }

    validateInvitation(token);
  }, [token, validateInvitation, navigate, toast]);

  // Pré-preencher email quando convite for carregado
  useEffect(() => {
    if (invitation && invitation.email && !formData.email) {
      console.log('📧 Preenchendo email do convite:', invitation.email);
      setFormData(prev => ({ 
        ...prev, 
        email: invitation.email 
      }));
    }
  }, [invitation, formData.email]);

  // Função para validar formulário
  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Nome completo é obrigatório';
    } else if (formData.fullName.trim().length < 3) {
      errors.fullName = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }

    if (!formData.crm.trim()) {
      errors.crm = 'CRM é obrigatório';
    } else if (!/^\d{4,6}$/.test(formData.crm.trim())) {
      errors.crm = 'CRM deve ter entre 4 e 6 dígitos';
    }

    if (!formData.specialty.trim()) {
      errors.specialty = 'Especialidade é obrigatória';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Função para lidar com mudanças no formulário
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Função para submeter o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 Submetendo formulário de registro');
    
    if (!validateForm()) {
      console.log('❌ Formulário com erros:', formErrors);
      toast({
        title: 'Dados Inválidos',
        description: 'Por favor, corrija os erros no formulário',
        variant: 'destructive'
      });
      return;
    }

    if (!invitation) {
      console.error('❌ Tentativa de registro sem convite válido');
      toast({
        title: 'Erro',
        description: 'Convite não validado. Recarregue a página.',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('🚀 Iniciando registro do médico...');
      
      await registerDoctor({
        ...formData,
        invitationToken: token!,
        invitationId: invitation.id,
        organizationId: invitation.organization_id
      });

      console.log('✅ Registro concluído com sucesso');
      
      toast({
        title: 'Cadastro Realizado!',
        description: 'Sua conta foi criada com sucesso. Faça login para continuar.',
        variant: 'default'
      });

      // Redirecionar para a tela de login com mensagem de sucesso
      setTimeout(() => {
        navigate('/auth?message=Conta criada com sucesso! Faça login para continuar.');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Erro no registro:', error);
      
      toast({
        title: 'Erro no Cadastro',
        description: error.message || 'Erro inesperado. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  // Loading inicial
  if (validatingInvitation) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-white">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
              <div className="text-center">
                <p className="font-medium">Validando convite...</p>
                <p className="text-sm text-slate-400">Aguarde um momento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Erro na validação
  if (invitationError || !invitation) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Problema com o Convite
            </CardTitle>
            <CardDescription className="text-slate-400">
              Não foi possível validar seu convite
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-900/20 p-3 rounded-lg border border-red-700">
              <p className="text-red-300 text-sm">
                {invitationError || 'Convite inválido ou expirado'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={retryValidation}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Tentar Novamente
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/doctors/accept-invitation')}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formulário de registro
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <UserPlus className="w-5 h-5 text-green-500" />
            Criar Conta de Médico
          </CardTitle>
          <CardDescription className="text-slate-400">
            Complete seu cadastro para acessar a plataforma da {invitation.organization?.name}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Status do convite */}
          <div className="bg-green-900/20 p-3 rounded-lg border border-green-700 mb-6">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Convite Validado</span>
            </div>
            <p className="text-green-300 text-sm">
              Email: {invitation.email} • Farmácia: {invitation.organization?.name}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white">Nome Completo *</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Seu nome completo"
                className={`bg-slate-800 border-slate-700 text-white ${
                  formErrors.fullName ? 'border-red-500' : ''
                }`}
              />
              {formErrors.fullName && (
                <p className="text-red-400 text-sm">{formErrors.fullName}</p>
              )}
            </div>

            {/* Email (readonly) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                readOnly
                className="bg-slate-700 border-slate-600 text-slate-300"
              />
              <p className="text-slate-400 text-xs">
                Email do convite (não pode ser alterado)
              </p>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Senha *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className={`bg-slate-800 border-slate-700 text-white pr-10 ${
                    formErrors.password ? 'border-red-500' : ''
                  }`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-slate-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {formErrors.password && (
                <p className="text-red-400 text-sm">{formErrors.password}</p>
              )}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Confirmar Senha *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Digite a senha novamente"
                  className={`bg-slate-800 border-slate-700 text-white pr-10 ${
                    formErrors.confirmPassword ? 'border-red-500' : ''
                  }`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-slate-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {formErrors.confirmPassword && (
                <p className="text-red-400 text-sm">{formErrors.confirmPassword}</p>
              )}
            </div>

            {/* CRM e Especialidade em linha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crm" className="text-white">CRM *</Label>
                <Input
                  id="crm"
                  type="text"
                  value={formData.crm}
                  onChange={(e) => handleInputChange('crm', e.target.value.replace(/\D/g, ''))}
                  placeholder="12345"
                  maxLength={6}
                  className={`bg-slate-800 border-slate-700 text-white ${
                    formErrors.crm ? 'border-red-500' : ''
                  }`}
                />
                {formErrors.crm && (
                  <p className="text-red-400 text-sm">{formErrors.crm}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty" className="text-white">Especialidade *</Label>
                <Input
                  id="specialty"
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                  placeholder="Ex: Cardiologia"
                  className={`bg-slate-800 border-slate-700 text-white ${
                    formErrors.specialty ? 'border-red-500' : ''
                  }`}
                />
                {formErrors.specialty && (
                  <p className="text-red-400 text-sm">{formErrors.specialty}</p>
                )}
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                type="submit"
                disabled={isRegistering}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando Conta...
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
                onClick={() => navigate('/doctors/accept-invitation')}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Convite
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorRegisterPage;
