
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useCreatePrescription, useValidateCpf } from '@/hooks/usePrescriptions';
import { Plus, Trash2, User, MapPin, Pill } from 'lucide-react';
import type { CreatePrescriptionData } from '@/types/prescriptions';

const prescriptionSchema = z.object({
  patient_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  patient_cpf: z.string().length(11, 'CPF deve ter 11 dígitos'),
  patient_birth_date: z.string().min(1, 'Data de nascimento é obrigatória'),
  patient_address: z.object({
    street: z.string().min(1, 'Logradouro é obrigatório'),
    number: z.string().min(1, 'Número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'Bairro é obrigatório'),
    city: z.string().min(1, 'Cidade é obrigatória'),
    state: z.string().length(2, 'Estado deve ter 2 caracteres'),
    zip_code: z.string().length(8, 'CEP deve ter 8 dígitos')
  }),
  clinical_indication: z.string().optional(),
  special_instructions: z.string().optional(),
  validity_days: z.number().min(1).max(365),
  items: z.array(z.object({
    medication_name: z.string().min(1, 'Nome do medicamento é obrigatório'),
    active_ingredients: z.array(z.object({
      name: z.string(),
      concentration: z.string()
    })),
    concentration: z.string().min(1, 'Concentração é obrigatória'),
    pharmaceutical_form: z.string().min(1, 'Forma farmacêutica é obrigatória'),
    quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
    dosage_instructions: z.string().min(1, 'Posologia é obrigatória'),
    duration_days: z.number().optional(),
    controlled_substance: z.boolean(),
    anvisa_code: z.string().optional()
  })).min(1, 'Pelo menos um medicamento deve ser adicionado')
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

const CreatePrescription = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createPrescription = useCreatePrescription();
  const validateCpf = useValidateCpf();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      validity_days: 30,
      items: [{
        medication_name: '',
        active_ingredients: [{ name: '', concentration: '' }],
        concentration: '',
        pharmaceutical_form: 'Cápsula',
        quantity: 1,
        dosage_instructions: '',
        controlled_substance: false
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const onSubmit = async (data: PrescriptionFormData) => {
    setIsSubmitting(true);
    try {
      // Validar CPF
      const cpfValid = await validateCpf.mutateAsync(data.patient_cpf);
      if (!cpfValid) {
        throw new Error('CPF inválido');
      }

      await createPrescription.mutateAsync(data as CreatePrescriptionData);
    } catch (error) {
      console.error('Erro ao criar prescrição:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addMedication = () => {
    append({
      medication_name: '',
      active_ingredients: [{ name: '', concentration: '' }],
      concentration: '',
      pharmaceutical_form: 'Cápsula',
      quantity: 1,
      dosage_instructions: '',
      controlled_substance: false
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Dados do Paciente */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Dados do Paciente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient_name">Nome Completo *</Label>
              <Input
                id="patient_name"
                {...register('patient_name')}
                className="bg-slate-700 border-slate-600"
              />
              {errors.patient_name && (
                <p className="text-red-400 text-sm mt-1">{errors.patient_name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="patient_cpf">CPF *</Label>
              <Input
                id="patient_cpf"
                {...register('patient_cpf')}
                placeholder="00000000000"
                maxLength={11}
                className="bg-slate-700 border-slate-600"
              />
              {errors.patient_cpf && (
                <p className="text-red-400 text-sm mt-1">{errors.patient_cpf.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="patient_birth_date">Data de Nascimento *</Label>
            <Input
              id="patient_birth_date"
              type="date"
              {...register('patient_birth_date')}
              className="bg-slate-700 border-slate-600"
            />
            {errors.patient_birth_date && (
              <p className="text-red-400 text-sm mt-1">{errors.patient_birth_date.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="street">Logradouro *</Label>
              <Input
                id="street"
                {...register('patient_address.street')}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="number">Número *</Label>
              <Input
                id="number"
                {...register('patient_address.number')}
                className="bg-slate-700 border-slate-600"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                {...register('patient_address.complement')}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="neighborhood">Bairro *</Label>
              <Input
                id="neighborhood"
                {...register('patient_address.neighborhood')}
                className="bg-slate-700 border-slate-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                {...register('patient_address.city')}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="state">Estado *</Label>
              <Input
                id="state"
                {...register('patient_address.state')}
                placeholder="SP"
                maxLength={2}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="zip_code">CEP *</Label>
              <Input
                id="zip_code"
                {...register('patient_address.zip_code')}
                placeholder="00000000"
                maxLength={8}
                className="bg-slate-700 border-slate-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medicamentos */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5" />
              Medicamentos
            </CardTitle>
            <Button type="button" onClick={addMedication} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 p-4 border border-slate-600 rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Medicamento {index + 1}</h4>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => remove(index)}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Medicamento *</Label>
                  <Input
                    {...register(`items.${index}.medication_name`)}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label>Concentração *</Label>
                  <Input
                    {...register(`items.${index}.concentration`)}
                    placeholder="Ex: 500mg"
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Forma Farmacêutica *</Label>
                  <Input
                    {...register(`items.${index}.pharmaceutical_form`)}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label>Quantidade *</Label>
                  <Input
                    type="number"
                    min="1"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label>Duração (dias)</Label>
                  <Input
                    type="number"
                    min="1"
                    {...register(`items.${index}.duration_days`, { valueAsNumber: true })}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
              </div>

              <div>
                <Label>Posologia *</Label>
                <Textarea
                  {...register(`items.${index}.dosage_instructions`)}
                  placeholder="Ex: Tomar 1 cápsula de 8 em 8 horas"
                  className="bg-slate-700 border-slate-600"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  {...register(`items.${index}.controlled_substance`)}
                />
                <Label>Medicamento Controlado</Label>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Informações Clínicas */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="clinical_indication">Indicação Clínica</Label>
            <Textarea
              id="clinical_indication"
              {...register('clinical_indication')}
              className="bg-slate-700 border-slate-600"
            />
          </div>

          <div>
            <Label htmlFor="special_instructions">Instruções Especiais</Label>
            <Textarea
              id="special_instructions"
              {...register('special_instructions')}
              className="bg-slate-700 border-slate-600"
            />
          </div>

          <div>
            <Label htmlFor="validity_days">Validade (dias)</Label>
            <Input
              id="validity_days"
              type="number"
              min="1"
              max="365"
              {...register('validity_days', { valueAsNumber: true })}
              className="bg-slate-700 border-slate-600"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? 'Criando...' : 'Criar Prescrição'}
        </Button>
      </div>
    </form>
  );
};

export default CreatePrescription;
