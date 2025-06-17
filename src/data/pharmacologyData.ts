
export interface ActiveData {
  name: string;
  maxDailyDose: number; // em mg
  unit: string;
  category: string;
  warnings: string[];
  contraindications?: string[];
}

export interface DrugInteraction {
  active1: string;
  active2: string;
  severity: 'leve' | 'moderada' | 'grave' | 'contraindicada';
  description: string;
  mechanism: string;
  clinicalEffect: string;
}

export const ACTIVE_DATABASE: Record<string, ActiveData> = {
  // Termogênicos e Emagrecimento
  'cafeina': {
    name: 'Cafeína',
    maxDailyDose: 400,
    unit: 'mg',
    category: 'estimulante',
    warnings: ['Evitar após 16h', 'Reduzir em hipertensos'],
    contraindications: ['Arritmias cardíacas', 'Hipertensão não controlada']
  },
  'efedrina': {
    name: 'Efedrina',
    maxDailyDose: 150,
    unit: 'mg',
    category: 'estimulante',
    warnings: ['Monitorar pressão arterial', 'Uso máximo 12 semanas'],
    contraindications: ['Cardiopatias', 'Hipertensão', 'Diabetes descompensado']
  },
  'sibutramina': {
    name: 'Sibutramina',
    maxDailyDose: 15,
    unit: 'mg',
    category: 'anorexígeno',
    warnings: ['Monitorar PA e FC', 'Descontinuar se PA >145/90'],
    contraindications: ['Cardiopatias', 'AVC prévio', 'Transtornos alimentares']
  },
  'orlistat': {
    name: 'Orlistat',
    maxDailyDose: 360,
    unit: 'mg',
    category: 'inibidor lipase',
    warnings: ['Suplementar vitaminas lipossolúveis', 'Tomar com refeições'],
    contraindications: ['Colestase', 'Má absorção crônica']
  },
  'morosil': {
    name: 'Morosil',
    maxDailyDose: 400,
    unit: 'mg',
    category: 'termogênico natural',
    warnings: ['Tomar com água abundante'],
    contraindications: []
  },
  'berberina': {
    name: 'Berberina',
    maxDailyDose: 1500,
    unit: 'mg',
    category: 'antidiabético natural',
    warnings: ['Monitorar glicemia', 'Dividir doses'],
    contraindications: ['Hipoglicemia', 'Uso de metformina em doses altas']
  },

  // Suplementos para Hipertrofia
  'creatina': {
    name: 'Creatina',
    maxDailyDose: 5000,
    unit: 'mg',
    category: 'ergogênico',
    warnings: ['Aumentar hidratação', 'Monitorar função renal'],
    contraindications: ['Insuficiência renal']
  },
  'hmb': {
    name: 'HMB',
    maxDailyDose: 3000,
    unit: 'mg',
    category: 'anticatabólico',
    warnings: ['Dividir em 3 doses'],
    contraindications: []
  },
  'l-arginina': {
    name: 'L-Arginina',
    maxDailyDose: 6000,
    unit: 'mg',
    category: 'vasodilatador',
    warnings: ['Pode reduzir PA'],
    contraindications: ['Hipotensão', 'Infarto recente']
  },
  'citrulina': {
    name: 'Citrulina',
    maxDailyDose: 8000,
    unit: 'mg',
    category: 'vasodilatador',
    warnings: ['Tomar 30min antes treino'],
    contraindications: []
  },
  'beta-alanina': {
    name: 'Beta-Alanina',
    maxDailyDose: 5000,
    unit: 'mg',
    category: 'ergogênico',
    warnings: ['Pode causar formigamento', 'Dividir doses'],
    contraindications: []
  },

  // Vitaminas e Minerais
  'vitamina-d': {
    name: 'Vitamina D',
    maxDailyDose: 4000,
    unit: 'UI',
    category: 'vitamina',
    warnings: ['Monitorar 25(OH)D sérica'],
    contraindications: ['Hipercalcemia', 'Nefrolitíase']
  },
  'zinco': {
    name: 'Zinco',
    maxDailyDose: 40,
    unit: 'mg',
    category: 'mineral',
    warnings: ['Tomar longe das refeições'],
    contraindications: ['Hemocromatose']
  },
  'magnesio': {
    name: 'Magnésio',
    maxDailyDose: 350,
    unit: 'mg',
    category: 'mineral',
    warnings: ['Pode causar diarreia em doses altas'],
    contraindications: ['Insuficiência renal grave']
  },
  'ferro': {
    name: 'Ferro',
    maxDailyDose: 45,
    unit: 'mg',
    category: 'mineral',
    warnings: ['Tomar longe de café/chá', 'Monitorar ferritina'],
    contraindications: ['Hemocromatose', 'Talassemia']
  },

  // Nootrópicos
  'piracetam': {
    name: 'Piracetam',
    maxDailyDose: 4800,
    unit: 'mg',
    category: 'nootrópico',
    warnings: ['Dividir em 2-3 doses'],
    contraindications: ['Hemorragia cerebral', 'Insuficiência renal grave']
  },
  'modafinil': {
    name: 'Modafinil',
    maxDailyDose: 400,
    unit: 'mg',
    category: 'eugeroico',
    warnings: ['Tomar pela manhã', 'Monitorar PA'],
    contraindications: ['Arritmias', 'Hipertensão não controlada']
  },

  // Antienvelhecimento
  'resveratrol': {
    name: 'Resveratrol',
    maxDailyDose: 1000,
    unit: 'mg',
    category: 'antioxidante',
    warnings: ['Pode potencializar anticoagulantes'],
    contraindications: ['Uso de varfarina']
  },
  'coenzima-q10': {
    name: 'Coenzima Q10',
    maxDailyDose: 300,
    unit: 'mg',
    category: 'antioxidante',
    warnings: ['Tomar com gorduras'],
    contraindications: []
  },

  // Hormônios e Precursores
  'dhea': {
    name: 'DHEA',
    maxDailyDose: 50,
    unit: 'mg',
    category: 'hormônio',
    warnings: ['Monitorar hormônios', 'Uso supervisionado'],
    contraindications: ['Câncer hormônio-dependente', 'Gravidez']
  },
  'melatonina': {
    name: 'Melatonina',
    maxDailyDose: 10,
    unit: 'mg',
    category: 'hormônio',
    warnings: ['Tomar 30min antes dormir', 'Evitar dirigir'],
    contraindications: ['Doenças autoimunes', 'Gravidez']
  }
};

export const DRUG_INTERACTIONS: DrugInteraction[] = [
  {
    active1: 'cafeina',
    active2: 'efedrina',
    severity: 'grave',
    description: 'Potencialização dos efeitos cardiovasculares',
    mechanism: 'Ambos estimulam o sistema nervoso simpático',
    clinicalEffect: 'Risco de arritmias, hipertensão grave, infarto'
  },
  {
    active1: 'sibutramina',
    active2: 'efedrina',
    severity: 'contraindicada',
    description: 'Combinação perigosa de anorexígenos',
    mechanism: 'Dupla estimulação noradrenérgica',
    clinicalEffect: 'Risco muito alto de eventos cardiovasculares'
  },
  {
    active1: 'l-arginina',
    active2: 'citrulina',
    severity: 'moderada',
    description: 'Potencialização do efeito vasodilatador',
    mechanism: 'Ambos aumentam produção de óxido nítrico',
    clinicalEffect: 'Hipotensão excessiva, especialmente em hipotensos'
  },
  {
    active1: 'ferro',
    active2: 'zinco',
    severity: 'moderada',
    description: 'Competição por absorção intestinal',
    mechanism: 'Competem pelo mesmo transportador (DMT1)',
    clinicalEffect: 'Redução da absorção de ambos minerais'
  },
  {
    active1: 'magnesio',
    active2: 'zinco',
    severity: 'leve',
    description: 'Possível redução de absorção',
    mechanism: 'Competição por transportadores',
    clinicalEffect: 'Leve redução da eficácia'
  },
  {
    active1: 'cafeina',
    active2: 'modafinil',
    severity: 'moderada',
    description: 'Potencialização dos efeitos estimulantes',
    mechanism: 'Ambos inibem recaptação de dopamina',
    clinicalEffect: 'Ansiedade, insônia, taquicardia'
  },
  {
    active1: 'berberina',
    active2: 'metformina',
    severity: 'moderada',
    description: 'Potencialização do efeito hipoglicemiante',
    mechanism: 'Ambos ativam AMPK e reduzem gliconeogênese',
    clinicalEffect: 'Risco de hipoglicemia'
  },
  {
    active1: 'resveratrol',
    active2: 'varfarina',
    severity: 'grave',
    description: 'Potencialização do efeito anticoagulante',
    mechanism: 'Resveratrol inibe agregação plaquetária',
    clinicalEffect: 'Risco aumentado de sangramento'
  },
  {
    active1: 'vitamina-d',
    active2: 'calcio',
    severity: 'moderada',
    description: 'Risco de hipercalcemia em doses altas',
    mechanism: 'Vitamina D aumenta absorção de cálcio',
    clinicalEffect: 'Hipercalcemia, nefrolitíase, arritmias'
  },
  {
    active1: 'dhea',
    active2: 'testosterona',
    severity: 'moderada',
    description: 'Potencialização dos efeitos androgênicos',
    mechanism: 'DHEA é precursor de testosterona',
    clinicalEffect: 'Efeitos androgênicos excessivos'
  }
];

export const getActiveData = (activeName: string): ActiveData | null => {
  const normalizedName = activeName.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/ácido|alfa|beta|l-|d-/g, '')
    .trim();
  
  return ACTIVE_DATABASE[normalizedName] || null;
};

export const findInteractions = (actives: string[]): DrugInteraction[] => {
  const interactions: DrugInteraction[] = [];
  
  for (let i = 0; i < actives.length; i++) {
    for (let j = i + 1; j < actives.length; j++) {
      const active1 = actives[i].toLowerCase().replace(/[^\w-]/g, '').replace(/\s+/g, '-');
      const active2 = actives[j].toLowerCase().replace(/[^\w-]/g, '').replace(/\s+/g, '-');
      
      const interaction = DRUG_INTERACTIONS.find(
        int => 
          (int.active1 === active1 && int.active2 === active2) ||
          (int.active1 === active2 && int.active2 === active1)
      );
      
      if (interaction) {
        interactions.push(interaction);
      }
    }
  }
  
  return interactions;
};
