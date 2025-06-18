
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

const pharmacySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  slug: z.string().min(2, 'URL deve ter pelo menos 2 caracteres').regex(/^[a-z0-9-]+$/, 'URL deve conter apenas letras minúsculas, números e hífens'),
  contactEmail: z.string().email('Email inválido'),
  phone: z.string().optional(),
  domain: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
});

type PharmacyFormData = z.infer<typeof pharmacySchema>;

interface PharmacyRegistrationFormProps {
  onSubmit: (data: PharmacyFormData) => void;
  loading?: boolean;
}

const PharmacyRegistrationForm = ({ onSubmit, loading = false }: PharmacyRegistrationFormProps) => {
  const [slugGenerated, setSlugGenerated] = useState(false);

  const form = useForm<PharmacyFormData>({
    resolver: zodResolver(pharmacySchema),
    defaultValues: {
      name: '',
      slug: '',
      contactEmail: '',
      phone: '',
      domain: '',
      address: '',
      description: '',
    },
  });

  const generateSlug = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50);
    
    return slug;
  };

  const handleNameChange = (name: string) => {
    form.setValue('name', name);
    if (!slugGenerated || !form.getValues('slug')) {
      form.setValue('slug', generateSlug(name));
    }
  };

  const handleSlugChange = (slug: string) => {
    form.setValue('slug', slug);
    setSlugGenerated(true);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Informações da Farmácia
        </CardTitle>
        <CardDescription>
          Preencha os dados da sua farmácia para criar sua conta B2B
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Nome da Farmácia *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleNameChange(e.target.value);
                        }}
                        placeholder="Ex: Farmácia Central"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">URL da Farmácia *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleSlugChange(e.target.value);
                        }}
                        placeholder="farmacia-central"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormDescription className="text-slate-400">
                      Esta será sua URL: app.exemplo.com/{form.watch('slug')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email de Contato *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="contato@farmacia.com"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Telefone
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="(11) 99999-9999"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Domínio Personalizado (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="www.farmacia.com"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </FormControl>
                  <FormDescription className="text-slate-400">
                    Caso tenha um domínio próprio para sua farmácia
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Endereço
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Rua, número, bairro, cidade, estado, CEP"
                      className="bg-slate-700 border-slate-600 text-white"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Descrição da Farmácia</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Breve descrição sobre sua farmácia, especialidades e diferenciais"
                      className="bg-slate-700 border-slate-600 text-white"
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription className="text-slate-400">
                    Esta informação ajudará os médicos a conhecer melhor sua farmácia
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {loading ? 'Criando farmácia...' : 'Continuar para Planos'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PharmacyRegistrationForm;
