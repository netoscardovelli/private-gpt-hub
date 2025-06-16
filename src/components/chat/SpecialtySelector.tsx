
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SpecialtySelectorProps {
  selectedSpecialty: string;
  onSpecialtyChange: (specialty: string) => void;
}

const specialties = [
  { value: 'geral', label: 'Medicina Geral' },
  { value: 'dermatologia', label: 'Dermatologia' },
  { value: 'endocrinologia', label: 'Endocrinologia' },
  { value: 'cardiologia', label: 'Cardiologia' },
  { value: 'ginecologia', label: 'Ginecologia' },
  { value: 'ortopedia', label: 'Ortopedia' },
  { value: 'neurologia', label: 'Neurologia' },
  { value: 'psiquiatria', label: 'Psiquiatria' },
  { value: 'geriatria', label: 'Geriatria' },
  { value: 'pediatria', label: 'Pediatria' },
  { value: 'medicina-esportiva', label: 'Medicina Esportiva' },
  { value: 'nutrologia', label: 'Nutrologia' },
];

const SpecialtySelector = ({ selectedSpecialty, onSpecialtyChange }: SpecialtySelectorProps) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-slate-400 hidden sm:block whitespace-nowrap">Especialidade:</span>
      <Select value={selectedSpecialty} onValueChange={onSpecialtyChange}>
        <SelectTrigger className="w-40 sm:w-48 h-9 bg-slate-700 border-slate-600 text-xs text-white hover:bg-slate-600 transition-colors">
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent className="bg-slate-700 border-slate-600 z-50">
          {specialties.map((specialty) => (
            <SelectItem 
              key={specialty.value} 
              value={specialty.value}
              className="text-white hover:bg-slate-600 focus:bg-slate-600 text-xs cursor-pointer"
            >
              {specialty.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SpecialtySelector;
