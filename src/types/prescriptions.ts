
export interface Prescription {
  id: string;
  prescription_number: string;
  doctor_id: string;
  patient_name: string;
  patient_cpf: string;
  patient_birth_date: string;
  patient_address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
  pharmacy_id?: string;
  organization_id: string;
  prescription_date: string;
  validity_date: string;
  clinical_indication?: string;
  special_instructions?: string;
  digital_signature?: any;
  qr_code?: string;
  status: 'active' | 'dispensed' | 'expired' | 'cancelled';
  controlled_medication: boolean;
  sngpc_reported: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  medication_name: string;
  active_ingredients: {
    name: string;
    concentration: string;
  }[];
  concentration: string;
  pharmaceutical_form: string;
  quantity: number;
  dosage_instructions: string;
  duration_days?: number;
  controlled_substance: boolean;
  anvisa_code?: string;
  created_at: string;
}

export interface PrescriptionTemplate {
  id: string;
  name: string;
  organization_id: string;
  doctor_id?: string;
  template_data: {
    clinical_indication?: string;
    special_instructions?: string;
    items: Omit<PrescriptionItem, 'id' | 'prescription_id' | 'created_at'>[];
  };
  is_default: boolean;
  specialty?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DispensationLog {
  id: string;
  prescription_id: string;
  prescription_item_id: string;
  pharmacist_id: string;
  pharmacy_id: string;
  dispensed_quantity: number;
  dispensation_date: string;
  patient_signature?: any;
  notes?: string;
  created_at: string;
}

export interface DigitalSignature {
  id: string;
  prescription_id: string;
  signer_id: string;
  certificate_info: {
    subject: string;
    issuer: string;
    serial_number: string;
    valid_from: string;
    valid_to: string;
  };
  signature_data: string;
  timestamp_data?: any;
  signature_type: 'doctor' | 'pharmacist' | 'patient';
  is_valid: boolean;
  created_at: string;
}

export interface CreatePrescriptionData {
  patient_name: string;
  patient_cpf: string;
  patient_birth_date: string;
  patient_address: Prescription['patient_address'];
  clinical_indication?: string;
  special_instructions?: string;
  validity_days: number;
  items: Omit<PrescriptionItem, 'id' | 'prescription_id' | 'created_at'>[];
}
