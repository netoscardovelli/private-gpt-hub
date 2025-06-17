
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useFormulaDetection } from '@/hooks/useFormulaDetection';
import ActiveSelector from './ActiveSelector';
import FormulaOptionSelector from './FormulaOptionSelector';
import FormulaSelector from './FormulaSelector';
import DosageInput from './DosageInput';

interface QuickActiveAdderProps {
  onAddActive: (actives: any[]) => void;
  currentFormula: string;
  specialty: string;
}

type Step = 'select-active' | 'select-option' | 'select-formula' | 'input-dosage';

const QuickActiveAdder = ({ onAddActive, currentFormula, specialty }: QuickActiveAdderProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('select-active');
  const [selectedActive, setSelectedActive] = useState('');
  const [selectedOption, setSelectedOption] = useState<'existing' | 'new' | ''>('');
  const [selectedFormulaIndex, setSelectedFormulaIndex] = useState<number>(-1);
  const { toast } = useToast();
  const { detectedFormulas } = useFormulaDetection(currentFormula);

  const handleActiveContinue = (activeName: string) => {
    setSelectedActive(activeName);
    
    if (detectedFormulas.length > 0) {
      setCurrentStep('select-option');
    } else {
      setSelectedOption('new');
      setCurrentStep('input-dosage');
    }
  };

  const handleOptionSelect = (option: 'existing' | 'new') => {
    setSelectedOption(option);
    if (option === 'existing') {
      setCurrentStep('select-formula');
    } else {
      setCurrentStep('input-dosage');
    }
  };

  const handleFormulaSelect = (index: number) => {
    setSelectedFormulaIndex(index);
    setCurrentStep('input-dosage');
  };

  const handleDosageConfirm = (dosage: string) => {
    const newActive = {
      name: selectedActive,
      concentration: dosage || 'A definir',
      benefit: 'Conforme análise clínica',
      mechanism: 'Revisar literatura',
      formulaIndex: selectedOption === 'existing' ? selectedFormulaIndex : -1,
      createNew: selectedOption === 'new'
    };

    console.log('🚀 Adicionando ativo:', newActive);
    onAddActive([newActive]);
    
    toast({
      title: "Ativo adicionado!",
      description: `${selectedActive} será incluído na análise`,
    });

    // Reset
    setCurrentStep('select-active');
    setSelectedActive('');
    setSelectedOption('');
    setSelectedFormulaIndex(-1);
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'select-option':
        setCurrentStep('select-active');
        break;
      case 'select-formula':
        setCurrentStep('select-option');
        break;
      case 'input-dosage':
        if (selectedOption === 'existing') {
          setCurrentStep('select-formula');
        } else {
          setCurrentStep(detectedFormulas.length > 0 ? 'select-option' : 'select-active');
        }
        break;
    }
  };

  switch (currentStep) {
    case 'select-active':
      return <ActiveSelector onContinue={handleActiveContinue} specialty={specialty} />;
    
    case 'select-option':
      return (
        <FormulaOptionSelector
          activeName={selectedActive}
          formulasCount={detectedFormulas.length}
          onSelectOption={handleOptionSelect}
        />
      );
    
    case 'select-formula':
      return (
        <FormulaSelector
          formulas={detectedFormulas}
          selectedFormulas={[]}
          onFormulaToggle={() => {}}
          onConfirm={() => {}}
          onCancel={handleBack}
          activeName={selectedActive}
        />
      );
    
    case 'input-dosage':
      return (
        <DosageInput
          activeName={selectedActive}
          isNewFormula={selectedOption === 'new'}
          formulaIndex={selectedFormulaIndex}
          onConfirm={handleDosageConfirm}
          onBack={handleBack}
        />
      );
    
    default:
      return null;
  }
};

export default QuickActiveAdder;
