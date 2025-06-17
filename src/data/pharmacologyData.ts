export interface DrugInfo {
  maxDailyDose: number;
  unit: string;
  commonDoses: number[];
  warnings?: string[];
  interactions?: string[];
  mechanism?: string;
  category?: string;
  clinicalIndications?: string[];
  contraindications?: string[];
  recommendedDose?: string;
  pubmedReferences?: string[];
  technicalSources?: string[];
  clinicalTrials?: string[];
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
    category: 'Antidiabético',
    clinicalIndications: ['Diabetes tipo 2', 'Resistência insulínica', 'Síndrome metabólica'],
    recommendedDose: '500mg, 2-3x ao dia'
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
    category: 'Coenzima',
    clinicalIndications: ['Fibromialgia', 'Fadiga crônica', 'Disfunção mitocondrial'],
    recommendedDose: '100-200mg ao dia, dividido em 2 doses'
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
  'magnesio quelato': {
    maxDailyDose: 400,
    unit: 'mg',
    commonDoses: [150, 200, 300, 400],
    warnings: ['Pode causar diarreia em doses altas (>400mg)'],
    mechanism: 'Cofator enzimático, relaxamento muscular',
    category: 'Mineral',
    clinicalIndications: ['Fibromialgia', 'Cãibras musculares', 'Ansiedade', 'Insônia'],
    recommendedDose: '150-300mg ao dia, dividido em 2 doses',
    contraindications: ['Insuficiência renal grave']
  },
  'magnesio': {
    maxDailyDose: 400,
    unit: 'mg',
    commonDoses: [200, 300, 400],
    warnings: ['Pode causar diarreia em doses altas'],
    mechanism: 'Cofator enzimático',
    category: 'Mineral'
  },
  'zinco quelato': {
    maxDailyDose: 40,
    unit: 'mg',
    commonDoses: [15, 30, 40],
    warnings: ['Doses >15mg podem interferir com absorção de cobre'],
    interactions: ['cobre', 'ferro'],
    mechanism: 'Cofator enzimático',
    category: 'Mineral',
    clinicalIndications: ['Deficiência imunológica', 'Cicatrização', 'Acne'],
    recommendedDose: '8-15mg ao dia para adultos. Doses terapêuticas: 15-30mg',
    contraindications: ['Doses >40mg podem causar deficiência de cobre']
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
  'acido malico': {
    maxDailyDose: 800,
    unit: 'mg',
    commonDoses: [150, 300, 600, 800],
    warnings: ['Pode causar desconforto gástrico em doses altas'],
    mechanism: 'Cofator do ciclo de Krebs, produção de ATP',
    category: 'Ácido orgânico',
    clinicalIndications: ['Fibromialgia', 'Fadiga crônica', 'Dor muscular'],
    recommendedDose: '150-300mg, 2x ao dia'
  },
  '5htp': {
    maxDailyDose: 300,
    unit: 'mg',
    commonDoses: [50, 100, 200],
    warnings: ['Pode causar náuseas, sonolência', 'Não usar com antidepressivos'],
    interactions: ['ISRS', 'IMAO', 'triptanos'],
    mechanism: 'Precursor da serotonina',
    category: 'Aminoácido',
    clinicalIndications: ['Depressão leve', 'Insônia', 'Fibromialgia'],
    recommendedDose: '50-100mg ao dia, preferencialmente à noite',
    contraindications: ['Síndrome serotoninérgica', 'uso concomitante com antidepressivos']
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
  },

  // NOVOS ATIVOS COMPLEMENTARES - Base científica expandida
  'ashwagandha': {
    maxDailyDose: 600,
    unit: 'mg',
    commonDoses: [300, 500, 600],
    warnings: ['Pode interagir com medicamentos para tireoide', 'Evitar na gravidez'],
    interactions: ['levotiroxina', 'imunossupressores'],
    mechanism: 'Adaptógeno, modulação do cortisol',
    category: 'Fitoterapico',
    clinicalIndications: ['Estresse crônico', 'Ansiedade', 'Fadiga adrenal', 'Insônia'],
    recommendedDose: '300-500mg, 1-2x ao dia',
    contraindications: ['Gravidez', 'Lactação', 'Doenças autoimunes'],
    pubmedReferences: ['PMID: 34572318', 'PMID: 31991540'],
    technicalSources: ['Galena - Ficha técnica WS-KSM66', 'Fagron - Monografia adaptógenos'],
    clinicalTrials: ['NCT02725190 - Estresse e ansiedade']
  },

  'rhodiola rosea': {
    maxDailyDose: 400,
    unit: 'mg',
    commonDoses: [200, 300, 400],
    warnings: ['Pode causar insônia se tomado à noite'],
    interactions: ['antidepressivos', 'estimulantes'],
    mechanism: 'Adaptógeno, inibição da MAO',
    category: 'Fitoterapico',
    clinicalIndications: ['Fadiga mental', 'Depressão leve', 'Performance cognitiva'],
    recommendedDose: '200-400mg pela manhã',
    pubmedReferences: ['PMID: 32278461', 'PMID: 31972751'],
    technicalSources: ['Infinity Pharma - Alegação ANVISA aprovada'],
    clinicalTrials: ['NCT01988571 - Fadiga relacionada ao estresse']
  },

  'bacopa monnieri': {
    maxDailyDose: 600,
    unit: 'mg',
    commonDoses: [300, 500, 600],
    warnings: ['Pode causar náuseas se tomado em jejum'],
    mechanism: 'Colinérgico, neuroproteção',
    category: 'Nootrópico',
    clinicalIndications: ['Memória', 'Concentração', 'Ansiedade'],
    recommendedDose: '300mg, 2x ao dia com alimentos',
    pubmedReferences: ['PMID: 31551038', 'PMID: 27890007'],
    technicalSources: ['Galena - Bacognize padronizado'],
    clinicalTrials: ['NCT01046019 - Função cognitiva']
  },

  'lion s mane': {
    maxDailyDose: 1000,
    unit: 'mg',
    commonDoses: [500, 750, 1000],
    warnings: ['Pode causar reações alérgicas em sensíveis a fungos'],
    mechanism: 'Estimulação do NGF (Nerve Growth Factor)',
    category: 'Fungo medicinal',
    clinicalIndications: ['Neuroproteção', 'Função cognitiva', 'Neuropatia'],
    recommendedDose: '500-1000mg ao dia',
    pubmedReferences: ['PMID: 31413233', 'PMID: 32684080'],
    technicalSources: ['Fagron - Extrato padronizado'],
    clinicalTrials: ['NCT04264702 - Declínio cognitivo leve']
  },

  'curcumina': {
    maxDailyDose: 1500,
    unit: 'mg',
    commonDoses: [500, 1000, 1500],
    warnings: ['Pode aumentar absorção de outros medicamentos', 'Evitar com anticoagulantes'],
    interactions: ['varfarina', 'aspirina', 'quimioterápicos'],
    mechanism: 'Inibição NF-κB, anti-inflamatório',
    category: 'Polifenol',
    clinicalIndications: ['Inflamação crônica', 'Artrite', 'Proteção hepática'],
    recommendedDose: '500-1000mg com piperina para absorção',
    contraindications: ['Obstrução biliar', 'Cálculos biliares'],
    pubmedReferences: ['PMID: 33902773', 'PMID: 32916618'],
    technicalSources: ['Galena - Curcumin C3 Complex', 'Infinity - Meriva tecnologia fitossoma'],
    clinicalTrials: ['NCT03865992 - Artrite reumatoide']
  },

  'quetiapina': {
    maxDailyDose: 800,
    unit: 'mg',
    commonDoses: [25, 50, 100, 200],
    warnings: ['Sonolência', 'Ganho de peso', 'Risco de diabetes'],
    interactions: ['depressores do SNC', 'CYP3A4'],
    mechanism: 'Antagonista dopaminérgico e serotoninérgico',
    category: 'Antipsicótico atípico',
    clinicalIndications: ['Transtorno bipolar', 'Esquizofrenia', 'Depressão resistente'],
    recommendedDose: 'Individualizada conforme indicação',
    contraindications: ['Coma', 'Intoxicação por álcool'],
    pubmedReferences: ['PMID: 33201207', 'PMID: 32847686'],
    technicalSources: ['ANVISA - Bula de referência'],
    clinicalTrials: ['NCT03947138 - Transtorno bipolar']
  },

  'naltrexona': {
    maxDailyDose: 50,
    unit: 'mg',
    commonDoses: [1.5, 3, 4.5, 50],
    warnings: ['Hepatotoxicidade em doses altas', 'Síndrome de abstinência'],
    interactions: ['opioides', 'álcool'],
    mechanism: 'Antagonista opioide, modulação imune (LDN)',
    category: 'Antagonista opioide',
    clinicalIndications: ['Dependência química', 'Doenças autoimunes (LDN)', 'Fibromialgia'],
    recommendedDose: 'LDN: 1.5-4.5mg; Dependência: 50mg',
    contraindications: ['Uso de opioides', 'Hepatite aguda'],
    pubmedReferences: ['PMID: 33038252', 'PMID: 31891956'],
    technicalSources: ['Galena - LDN protocolo específico'],
    clinicalTrials: ['NCT02829242 - Fibromialgia com LDN']
  },

  'melatonina': {
    maxDailyDose: 10,
    unit: 'mg',
    commonDoses: [0.5, 1, 3, 5, 10],
    warnings: ['Sonolência diurna', 'Interação com anticoagulantes'],
    interactions: ['varfarina', 'fluvoxamina', 'nifedipina'],
    mechanism: 'Agonista receptor melatoninérgico',
    category: 'Hormônio',
    clinicalIndications: ['Insônia', 'Jet lag', 'Transtornos do ritmo circadiano'],
    recommendedDose: '0.5-3mg, 30min antes de dormir',
    contraindications: ['Gravidez', 'Doenças autoimunes'],
    pubmedReferences: ['PMID: 33940755', 'PMID: 32101743'],
    technicalSources: ['Fagron - Formas de liberação controlada'],
    clinicalTrials: ['NCT04470427 - Insônia primária']
  },

  'vitamina b12': {
    maxDailyDose: 2000,
    unit: 'mcg',
    commonDoses: [500, 1000, 2000],
    warnings: ['Pode mascarar deficiência de folato'],
    interactions: ['metformina', 'omeprazol'],
    mechanism: 'Cofator na síntese de DNA e mielina',
    category: 'Vitamina',
    clinicalIndications: ['Anemia megaloblástica', 'Neuropatia', 'Fadiga'],
    recommendedDose: '500-1000mcg ao dia ou conforme deficiência',
    pubmedReferences: ['PMID: 33827782', 'PMID: 32746937'],
    technicalSources: ['Galena - Metilcobalamina ativa'],
    clinicalTrials: ['NCT04293380 - Neuropatia diabética']
  },

  'vitamina k2': {
    maxDailyDose: 200,
    unit: 'mcg',
    commonDoses: [45, 90, 180],
    warnings: ['Interação com anticoagulantes'],
    interactions: ['varfarina', 'acenocumarol'],
    mechanism: 'Carboxilação de proteínas dependentes de vitamina K',
    category: 'Vitamina',
    clinicalIndications: ['Saúde óssea', 'Saúde cardiovascular', 'Osteoporose'],
    recommendedDose: '45-180mcg ao dia',
    contraindications: ['Uso de anticoagulantes'],
    pubmedReferences: ['PMID: 33063475', 'PMID: 31991517'],
    technicalSources: ['Fagron - MK-7 forma ativa'],
    clinicalTrials: ['NCT03689933 - Densidade óssea']
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
  },
  '5htp': {
    'fluoxetina': 'Risco de síndrome serotoninérgica',
    'sertralina': 'Risco de síndrome serotoninérgica',
    'paroxetina': 'Risco de síndrome serotoninérgica'
  },
  'ashwagandha': {
    'levotiroxina': 'Pode aumentar hormônios tireoidianos, monitorar TSH',
    'imunossupressores': 'Pode antagonizar efeitos imunossupressores'
  },
  'rhodiola rosea': {
    'antidepressivos': 'Pode potencializar efeitos serotoninérgicos',
    'estimulantes': 'Risco de overstimulação'
  },
  'curcumina': {
    'varfarina': 'Pode potencializar efeito anticoagulante',
    'quimioterápicos': 'Pode alterar biodisponibilidade'
  },
  'quetiapina': {
    'álcool': 'Potencialização da sedação',
    'CYP3A4 inibidores': 'Aumento dos níveis plasmáticos'
  },
  'naltrexona': {
    'opioides': 'Bloqueia completamente efeitos analgésicos',
    'álcool': 'Reduz craving, mas não elimina hepatotoxicidade'
  },
  'melatonina': {
    'fluvoxamina': 'Aumenta significativamente níveis de melatonina',
    'nifedipina': 'Pode reduzir eficácia anti-hipertensiva'
  },
  'vitamina k2': {
    'varfarina': 'Pode reduzir eficácia anticoagulante, monitorar INR'
  }
};

// Função para verificar indicações clínicas baseadas na condição
export const getIndicationBasedSuggestions = (condition: string): string[] => {
  const conditionLower = condition.toLowerCase();
  const suggestions: string[] = [];
  
  if (conditionLower.includes('fibromialgia')) {
    suggestions.push('vitamina d3', 'omega 3', 'curcuma', 'magnesio quelato', 'naltrexona');
  }
  
  if (conditionLower.includes('diabetes') || conditionLower.includes('glicemia')) {
    suggestions.push('berberina', 'acido alfa lipoico', 'picolinato de cromo');
  }
  
  if (conditionLower.includes('emagrecimento') || conditionLower.includes('obesidade')) {
    suggestions.push('l carnitina', 'picolinato de cromo', 'berberina');
  }

  if (conditionLower.includes('ansiedade') || conditionLower.includes('estresse')) {
    suggestions.push('ashwagandha', 'magnesio quelato', '5htp', 'bacopa monnieri');
  }

  if (conditionLower.includes('insônia') || conditionLower.includes('sono')) {
    suggestions.push('melatonina', 'ashwagandha', 'magnesio quelato');
  }

  if (conditionLower.includes('cognitivo') || conditionLower.includes('memória')) {
    suggestions.push('bacopa monnieri', 'lion s mane', 'rhodiola rosea');
  }

  if (conditionLower.includes('inflamação') || conditionLower.includes('artrite')) {
    suggestions.push('curcumina', 'omega 3', 'resveratrol');
  }

  if (conditionLower.includes('fadiga') || conditionLower.includes('cansaço')) {
    suggestions.push('rhodiola rosea', 'ashwagandha', 'coenzima q10', 'vitamina b12');
  }
  
  return suggestions;
};

// Nova função para buscar referências científicas
export const getScientificReferences = (activeName: string): {
  pubmed: string[];
  technical: string[];
  trials: string[];
} => {
  const drug = DRUG_DATABASE[activeName.toLowerCase()];
  return {
    pubmed: drug?.pubmedReferences || [],
    technical: drug?.technicalSources || [],
    trials: drug?.clinicalTrials || []
  };
};

// Nova função para verificar compatibilidade entre ativos
export const checkCompatibility = (active1: string, active2: string): {
  compatible: boolean;
  interaction?: string;
  severity?: 'low' | 'moderate' | 'high';
} => {
  const interactions = DRUG_INTERACTIONS[active1.toLowerCase()];
  if (interactions && interactions[active2.toLowerCase()]) {
    return {
      compatible: false,
      interaction: interactions[active2.toLowerCase()],
      severity: 'moderate' // Default, pode ser refinado
    };
  }
  return { compatible: true };
};

// NOVA SEÇÃO: Limites específicos para formulações tópicas
export const TOPICAL_SAFETY_LIMITS: Record<string, {
  maxPercentage: number;
  safeRange: [number, number];
  warnings: string[];
  mechanism: string;
}> = {
  'arnica': {
    maxPercentage: 5,
    safeRange: [1, 5],
    warnings: ['Acima de 5% pode causar dermatite de contato', 'Evitar em pele lesionada'],
    mechanism: 'Anti-inflamatório tópico'
  },
  'calendula': {
    maxPercentage: 10,
    safeRange: [2, 10],
    warnings: ['Concentrações altas podem causar sensibilização'],
    mechanism: 'Cicatrizante e anti-inflamatório'
  },
  'camomila': {
    maxPercentage: 10,
    safeRange: [1, 10],
    warnings: ['Pode causar reações alérgicas em sensíveis a asteráceas'],
    mechanism: 'Calmante e anti-inflamatório'
  },
  'mentol': {
    maxPercentage: 2,
    safeRange: [0.1, 2],
    warnings: ['Acima de 2% pode causar irritação intensa', 'Evitar em mucosas'],
    mechanism: 'Analgésico por efeito refrescante'
  },
  'canfora': {
    maxPercentage: 3,
    safeRange: [0.5, 3],
    warnings: ['Neurotóxica em altas concentrações', 'Contraindicada em crianças <2 anos'],
    mechanism: 'Contra-irritante e analgésico'
  },
  'salicilato de metila': {
    maxPercentage: 5,
    safeRange: [1, 5],
    warnings: ['Absorção sistêmica em grandes áreas', 'Evitar em alérgicos a salicilatos'],
    mechanism: 'Anti-inflamatório tópico'
  },
  'capsaicina': {
    maxPercentage: 0.1,
    safeRange: [0.025, 0.1],
    warnings: ['Extremamente irritante', 'Usar apenas em pequenas áreas'],
    mechanism: 'Depleção de substância P'
  },
  'lidocaina': {
    maxPercentage: 2,
    safeRange: [0.5, 2],
    warnings: ['Absorção sistêmica perigosa', 'Máximo 2% para uso tópico'],
    mechanism: 'Anestésico local'
  },
  'benzocaina': {
    maxPercentage: 5,
    safeRange: [1, 5],
    warnings: ['Risco de metahemoglobinemia', 'Evitar em mucosas'],
    mechanism: 'Anestésico local'
  },
  'urea': {
    maxPercentage: 40,
    safeRange: [5, 40],
    warnings: ['Acima de 20% pode causar irritação', 'Começar com concentrações baixas'],
    mechanism: 'Queratolítico e hidratante'
  },
  'acido salicilico': {
    maxPercentage: 5,
    safeRange: [0.5, 5],
    warnings: ['Absorção sistêmica significativa', 'Evitar em grandes áreas'],
    mechanism: 'Queratolítico e anti-inflamatório'
  },
  'tretinoina': {
    maxPercentage: 0.1,
    safeRange: [0.025, 0.1],
    warnings: ['Fotossensibilizante', 'Contraindicada na gravidez'],
    mechanism: 'Modulador da diferenciação celular'
  },
  'hidroquinona': {
    maxPercentage: 4,
    safeRange: [2, 4],
    warnings: ['Uso prolongado pode causar ocronose', 'Máximo 4% liberação magistral'],
    mechanism: 'Inibidor da tirosinase'
  }
};

// NOVA FUNÇÃO: Validação farmacotécnica para fórmulas tópicas
export const validateTopicalFormulation = (actives: Array<{name: string, percentage: number}>): {
  isValid: boolean;
  totalPercentage: number;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const totalPercentage = actives.reduce((sum, active) => sum + active.percentage, 0);
  
  // Erro crítico: mais de 100%
  if (totalPercentage > 100) {
    errors.push(`Total de ativos: ${totalPercentage}% - FISICAMENTE IMPOSSÍVEL!`);
  }
  
  // Warning: muito próximo de 100%
  if (totalPercentage > 85 && totalPercentage <= 100) {
    warnings.push(`Total de ativos: ${totalPercentage}% - Pouco espaço para excipientes (recomendado máximo 80%)`);
  }
  
  // Validar cada ativo individualmente
  actives.forEach(active => {
    const activeKey = active.name.toLowerCase()
      .replace(/ext\s+glicol\s+/g, '')
      .replace(/extrato\s+glicolico\s+/g, '')
      .replace(/\s+/g, '')
      .trim();
    
    const limit = TOPICAL_SAFETY_LIMITS[activeKey];
    if (limit) {
      if (active.percentage > limit.maxPercentage) {
        if (active.percentage > limit.maxPercentage * 2) {
          errors.push(`${active.name}: ${active.percentage}% PERIGOSO - Máximo seguro: ${limit.maxPercentage}%`);
        } else {
          warnings.push(`${active.name}: ${active.percentage}% acima do recomendado (máximo: ${limit.maxPercentage}%)`);
        }
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    totalPercentage,
    errors,
    warnings
  };
};

// NOVA FUNÇÃO: Verificação de incompatibilidades farmacotécnicas
export const checkFormulationCompatibility = (actives: string[]): {
  incompatibilities: Array<{
    active1: string;
    active2: string;
    reason: string;
    severity: 'critical' | 'moderate' | 'minor';
  }>;
} => {
  const incompatibilities = [];
  
  // Incompatibilidades conhecidas
  const knownIncompatibilities = {
    'acido ascorbico': {
      incompatibleWith: ['metais pesados', 'ferro', 'cobre'],
      reason: 'Oxidação e perda de atividade'
    },
    'retinol': {
      incompatibleWith: ['acido salicilico', 'benzoil peroxido'],
      reason: 'Irritação sinérgica e instabilidade'
    },
    'hidroquinona': {
      incompatibleWith: ['retinoides', 'acidos alfa-hidroxi'],
      reason: 'Irritação excessiva e possível sensibilização'
    }
  };
  
  // Verificar incompatibilidades
  actives.forEach((active1, i) => {
    actives.slice(i + 1).forEach(active2 => {
      const key1 = active1.toLowerCase().replace(/\s+/g, '');
      const key2 = active2.toLowerCase().replace(/\s+/g, '');
      
      const incomp = knownIncompatibilities[key1];
      if (incomp && incomp.incompatibleWith.some(inc => key2.includes(inc))) {
        incompatibilities.push({
          active1,
          active2,
          reason: incomp.reason,
          severity: 'moderate' as const
        });
      }
    });
  });
  
  return { incompatibilities };
};
