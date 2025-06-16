
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SpecialtySelectorProps {
  selectedSpecialty: string;
  onSpecialtyChange: (specialty: string) => void;
}

const specialties = [
  { value: 'geral', label: 'FULL', category: 'geral' },
  
  // Especialidades Médicas
  { value: 'dermatologia', label: 'Dermatologia', category: 'medico' },
  { value: 'endocrinologia', label: 'Endocrinologia', category: 'medico' },
  { value: 'cardiologia', label: 'Cardiologia', category: 'medico' },
  { value: 'ginecologia', label: 'Ginecologia', category: 'medico' },
  { value: 'ortopedia', label: 'Ortopedia', category: 'medico' },
  { value: 'neurologia', label: 'Neurologia', category: 'medico' },
  { value: 'psiquiatria', label: 'Psiquiatria', category: 'medico' },
  { value: 'geriatria', label: 'Geriatria', category: 'medico' },
  { value: 'pediatria', label: 'Pediatria', category: 'medico' },
  { value: 'medicina-esportiva', label: 'Medicina Esportiva', category: 'medico' },
  { value: 'nutrologia', label: 'Nutrologia', category: 'medico' },
  { value: 'medicina-integrativa', label: 'Medicina Integrativa', category: 'medico' },
  { value: 'medicina-da-dor', label: 'Medicina da Dor', category: 'medico' },
  
  // Outros Profissionais de Saúde
  { value: 'nutricionista', label: 'Nutricionista', category: 'outros' },
  { value: 'biomedicina', label: 'Biomedicina', category: 'outros' },
  { value: 'dentista', label: 'Dentista', category: 'outros' },
  { value: 'farmaceutico', label: 'Farmacêutico', category: 'outros' },
];

const SpecialtySelector = ({ selectedSpecialty, onSpecialtyChange }: SpecialtySelectorProps) => {
  const medicosEspecialidades = specialties.filter(s => s.category === 'medico');
  const outrosProfissionais = specialties.filter(s => s.category === 'outros');
  const geral = specialties.filter(s => s.category === 'geral');

  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-slate-400 hidden sm:block whitespace-nowrap">Especialidade:</span>
      <Select value={selectedSpecialty} onValueChange={onSpecialtyChange}>
        <SelectTrigger className="w-40 sm:w-48 h-9 bg-slate-700 border-slate-600 text-xs text-white hover:bg-slate-600 transition-colors">
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent className="bg-slate-700 border-slate-600 z-50 max-h-80 overflow-y-auto">
          {/* Opção Geral */}
          {geral.map((specialty) => (
            <SelectItem 
              key={specialty.value} 
              value={specialty.value}
              className="text-white hover:bg-slate-600 focus:bg-slate-600 text-xs cursor-pointer font-semibold"
            >
              {specialty.label}
            </SelectItem>
          ))}
          
          {/* Separador visual */}
          <div className="h-px bg-slate-600 mx-2 my-2"></div>
          
          {/* Seção Médicos */}
          <div className="px-2 py-1">
            <div className="text-xs font-semibold text-emerald-400 mb-1">👨‍⚕️ ESPECIALIDADES MÉDICAS</div>
            {medicosEspecialidades.map((specialty) => (
              <SelectItem 
                key={specialty.value} 
                value={specialty.value}
                className="text-white hover:bg-slate-600 focus:bg-slate-600 text-xs cursor-pointer pl-4"
              >
                {specialty.label}
              </SelectItem>
            ))}
          </div>
          
          {/* Separador visual */}
          <div className="h-px bg-slate-600 mx-2 my-2"></div>
          
          {/* Seção Outros Profissionais */}
          <div className="px-2 py-1">
            <div className="text-xs font-semibold text-blue-400 mb-1">🏥 OUTROS PROFISSIONAIS</div>
            {outrosProfissionais.map((specialty) => (
              <SelectItem 
                key={specialty.value} 
                value={specialty.value}
                className="text-white hover:bg-slate-600 focus:bg-slate-600 text-xs cursor-pointer pl-4"
              >
                {specialty.label}
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SpecialtySelector;
