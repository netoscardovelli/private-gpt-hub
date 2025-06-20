
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const DoctorRegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    crm: '',
    specialty: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({
        title: 'Erro',
        description: 'Token de convite não encontrado',
        variant: 'destructive'
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Erro',
        description: 'Senhas não coincidem',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🚀 Iniciando cadastro do médico...');
      
      // 1. Validar convite
      const { data: invitation, error: inviteError } = await supabase
        .from('doctor_invitations')
        .select('*, organization:organizations(id, name)')
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .single();

      if (inviteError || !invitation) {
        throw new Error('Convite inválido ou expirado');
      }

      // 2. Criar usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            crm: formData.crm,
            specialty: formData.specialty,
            organization_id: invitation.organization_id,
            role: 'doctor'
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // 3. Marcar convite como aceito
      await supabase
        .from('doctor_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      // 4. Criar perfil do médico
      if (authData.user) {
        await supabase
          .from('doctor_profiles')
          .insert({
            user_id: authData.user.id,
            specialty: formData.specialty,
            organization_id: invitation.organization_id
          });
      }

      console.log('✅ Cadastro concluído!');
      
      toast({
        title: 'Cadastro realizado!',
        description: 'Sua conta foi criada com sucesso.'
      });

      navigate('/auth?message=Conta criada! Faça login para continuar.');

    } catch (error: any) {
      console.error('❌ Erro:', error);
      toast({
        title: 'Erro no cadastro',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-red-400">Token de convite não encontrado</p>
            <Button 
              onClick={() => navigate('/')}
              className="mt-4"
            >
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <UserPlus className="w-5 h-5 text-green-500" />
            Cadastro de Médico
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crm" className="text-white">CRM</Label>
                <Input
                  id="crm"
                  type="text"
                  value={formData.crm}
                  onChange={(e) => setFormData(prev => ({ ...prev, crm: e.target.value }))}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty" className="text-white">Especialidade</Label>
                <Input
                  id="specialty"
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorRegisterPage;
