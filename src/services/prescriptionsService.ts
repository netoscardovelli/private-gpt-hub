
import { supabase } from '@/integrations/supabase/client';
import type { 
  Prescription, 
  PrescriptionItem, 
  PrescriptionTemplate, 
  DispensationLog,
  DigitalSignature,
  CreatePrescriptionData 
} from '@/types/prescriptions';

// Prescrições
export const fetchPrescriptionsApi = async (doctorId?: string): Promise<Prescription[]> => {
  let query = supabase
    .from('prescriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if (doctorId) {
    query = query.eq('doctor_id', doctorId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Prescription[];
};

export const fetchPrescriptionByIdApi = async (id: string): Promise<Prescription | null> => {
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Prescription | null;
};

export const createPrescriptionApi = async (
  prescriptionData: CreatePrescriptionData
): Promise<Prescription> => {
  const validityDate = new Date();
  validityDate.setDate(validityDate.getDate() + prescriptionData.validity_days);

  const { data: prescription, error: prescriptionError } = await supabase
    .from('prescriptions')
    .insert({
      doctor_id: (await supabase.auth.getUser()).data.user?.id,
      patient_name: prescriptionData.patient_name,
      patient_cpf: prescriptionData.patient_cpf,
      patient_birth_date: prescriptionData.patient_birth_date,
      patient_address: prescriptionData.patient_address,
      organization_id: '', // Will be set by RLS policies
      validity_date: validityDate.toISOString(),
      clinical_indication: prescriptionData.clinical_indication,
      special_instructions: prescriptionData.special_instructions,
      controlled_medication: prescriptionData.items.some(item => item.controlled_substance)
    })
    .select()
    .single();

  if (prescriptionError) throw prescriptionError;

  // Criar itens da prescrição
  const prescriptionItems = prescriptionData.items.map(item => ({
    ...item,
    prescription_id: prescription.id
  }));

  const { error: itemsError } = await supabase
    .from('prescription_items')
    .insert(prescriptionItems);

  if (itemsError) throw itemsError;

  return prescription as Prescription;
};

export const updatePrescriptionStatusApi = async (
  id: string, 
  status: Prescription['status']
): Promise<void> => {
  const { error } = await supabase
    .from('prescriptions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
};

// Itens de Prescrição
export const fetchPrescriptionItemsApi = async (prescriptionId: string): Promise<PrescriptionItem[]> => {
  const { data, error } = await supabase
    .from('prescription_items')
    .select('*')
    .eq('prescription_id', prescriptionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as PrescriptionItem[];
};

// Templates
export const fetchPrescriptionTemplatesApi = async (doctorId?: string): Promise<PrescriptionTemplate[]> => {
  let query = supabase
    .from('prescription_templates')
    .select('*')
    .order('name', { ascending: true });

  if (doctorId) {
    query = query.or(`doctor_id.eq.${doctorId},doctor_id.is.null`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as PrescriptionTemplate[];
};

export const createPrescriptionTemplateApi = async (
  template: Omit<PrescriptionTemplate, 'id' | 'created_at' | 'updated_at'>
): Promise<PrescriptionTemplate> => {
  const { data, error } = await supabase
    .from('prescription_templates')
    .insert(template)
    .select()
    .single();

  if (error) throw error;
  return data as PrescriptionTemplate;
};

// Logs de Dispensação
export const fetchDispensationLogsApi = async (prescriptionId: string): Promise<DispensationLog[]> => {
  const { data, error } = await supabase
    .from('dispensation_logs')
    .select('*')
    .eq('prescription_id', prescriptionId)
    .order('dispensation_date', { ascending: false });

  if (error) throw error;
  return (data || []) as DispensationLog[];
};

export const createDispensationLogApi = async (
  log: Omit<DispensationLog, 'id' | 'created_at'>
): Promise<DispensationLog> => {
  const { data, error } = await supabase
    .from('dispensation_logs')
    .insert(log)
    .select()
    .single();

  if (error) throw error;
  return data as DispensationLog;
};

// Assinaturas Digitais
export const fetchDigitalSignaturesApi = async (prescriptionId: string): Promise<DigitalSignature[]> => {
  const { data, error } = await supabase
    .from('digital_signatures')
    .select('*')
    .eq('prescription_id', prescriptionId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as DigitalSignature[];
};

export const createDigitalSignatureApi = async (
  signature: Omit<DigitalSignature, 'id' | 'created_at'>
): Promise<DigitalSignature> => {
  const { data, error } = await supabase
    .from('digital_signatures')
    .insert(signature)
    .select()
    .single();

  if (error) throw error;
  return data as DigitalSignature;
};

// Validação de CPF
export const validateCpfApi = async (cpf: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('validate_cpf', { cpf });
  if (error) throw error;
  return data as boolean;
};
