
export interface DrugInfo {
  maxDailyDose: number;
  unit: string;
  commonDoses: number[];
  warnings?: string[];
  interactions?: string[];
  mechanism?: string;
  category?: string;
}

export const DRUG_DATABASE: Record<string, DrugInfo> = {
  'saw palmetto': {
    maxDailyDose: 320,
    unit: 'mg',
    commonDoses: [160, 320],
    warnings: ['Pode interferir com hormônios'],
    interactions: ['finasterida', 'dutasterida'],
    mechanism: 'Inibidor da 5-alfa-redutase',
    category: 'Fitoterapico'
  },
  'morosil': {
    maxDailyDose: 400,
    unit: 'mg',
    commonDoses: [200, 400],
    warnings: ['Pode causar distúrbios gastrointestinais'],
    mechanism: 'Inibidor da síntese de ácidos graxos',
    category: 'Termogênico'
  },
  'berberina': {
    maxDailyDose: 1500,
    unit: 'mg',
    commonDoses: [500, 1000, 1500],
    warnings: ['Pode causar hipoglicemia', 'Interação com metformina'],
    interactions: ['metformina', 'insulina'],
    mechanism: 'Ativação da AMPK',
    category: 'Antidiabético'
  },
  'picolinato de cromo': {
    maxDailyDose: 400,
    unit: 'mcg',
    commonDoses: [200, 400],
    warnings: ['Doses altas podem causar problemas renais'],
    mechanism: 'Potencialização da insulina',
    category: 'Mineral'
  },
  'l carnitina': {
    maxDailyDose: 3000,
    unit: 'mg',
    commonDoses: [1000, 2000, 3000],
    warnings: ['Pode causar náuseas em doses altas'],
    mechanism: 'Transporte de ácidos graxos',
    category: 'Aminoácido'
  },
  'coenzima q10': {
    maxDailyDose: 300,
    unit: 'mg',
    commonDoses: [100, 200, 300],
    warnings: ['Pode interagir com anticoagulantes'],
    interactions: ['varfarina'],
    mechanism: 'Antioxidante mitocondrial',
    category: 'Coenzima'
  },
  'omega 3': {
    maxDailyDose: 3000,
    unit: 'mg',
    commonDoses: [1000, 2000, 3000],
    warnings: ['Pode aumentar risco de sangramento'],
    interactions: ['anticoagulantes'],
    mechanism: 'Anti-inflamatório',
    category: 'Ácido graxo'
  },
  'vitamina d3': {
    maxDailyDose: 4000,
    unit: 'UI',
    commonDoses: [1000, 2000, 4000],
    warnings: ['Doses altas podem causar hipercalcemia'],
    mechanism: 'Regulação do cálcio',
    category: 'Vitamina'
  },
  'magnésio': {
    maxDailyDose: 400,
    unit: 'mg',
    commonDoses: [200, 300, 400],
    warnings: ['Pode causar diarreia em doses altas'],
    mechanism: 'Cofator enzimático',
    category: 'Mineral'
  },
  'zinco': {
    maxDailyDose: 40,
    unit: 'mg',
    commonDoses: [15, 30, 40],
    warnings: ['Pode interferir com absorção de cobre'],
    interactions: ['cobre', 'ferro'],
    mechanism: 'Cofator enzimático',
    category: 'Mineral'
  },
  'acido alfa lipoico': {
    maxDailyDose: 600,
    unit: 'mg',
    commonDoses: [300, 600],
    warnings: ['Pode causar hipoglicemia'],
    interactions: ['insulina', 'metformina'],
    mechanism: 'Antioxidante',
    category: 'Antioxidante'
  },
  'resveratrol': {
    maxDailyDose: 500,
    unit: 'mg',
    commonDoses: [100, 250, 500],
    warnings: ['Pode interagir com anticoagulantes'],
    interactions: ['varfarina'],
    mechanism: 'Antioxidante polifenólico',
    category: 'Polifenol'
  },
  'curcuma': {
    maxDailyDose: 1000,
    unit: 'mg',
    commonDoses: [500, 1000],
    warnings: ['Pode aumentar risco de sangramento'],
    interactions: ['anticoagulantes'],
    mechanism: 'Anti-inflamatório',
    category: 'Fitoterapico'
  },
  'spirulina': {
    maxDailyDose: 3000,
    unit: 'mg',
    commonDoses: [1000, 2000, 3000],
    warnings: ['Pode conter contaminantes'],
    mechanism: 'Suplemento nutricional',
    category: 'Alga'
  },
  'chlorella': {
    maxDailyDose: 3000,
    unit: 'mg',
    commonDoses: [1000, 2000, 3000],
    warnings: ['Pode causar distúrbios gastrointestinais'],
    mechanism: 'Desintoxicante',
    category: 'Alga'
  }
};

export const DRUG_INTERACTIONS: Record<string, Record<string, string>> = {
  'saw palmetto': {
    'finasterida': 'Ambos inibem 5-alfa-redutase, pode potencializar efeitos',
    'dutasterida': 'Mecanismo similar, risco de potencialização'
  },
  'berberina': {
    'metformina': 'Ambos reduzem glicose, risco de hipoglicemia',
    'insulina': 'Pode potencializar efeito hipoglicemiante'
  },
  'coenzima q10': {
    'varfarina': 'Pode reduzir eficácia do anticoagulante'
  },
  'omega 3': {
    'anticoagulantes': 'Pode aumentar risco de sangramento'
  },
  'zinco': {
    'cobre': 'Zinco pode interferir na absorção de cobre',
    'ferro': 'Pode reduzir absorção de ferro'
  },
  'acido alfa lipoico': {
    'insulina': 'Pode potencializar efeito hipoglicemiante',
    'metformina': 'Ambos melhoram sensibilidade à insulina'
  },
  'resveratrol': {
    'varfarina': 'Pode potencializar efeito anticoagulante'
  },
  'curcuma': {
    'anticoagulantes': 'Pode aumentar risco de sangramento'
  }
};
