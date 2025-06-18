
import { CheckCircle } from 'lucide-react';

interface OnboardingStepsProps {
  currentStep: number;
  steps: string[];
}

const OnboardingSteps = ({ currentStep, steps }: OnboardingStepsProps) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep > index + 1
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : currentStep === index + 1
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'bg-slate-700 border-slate-600 text-slate-400'
              }`}
            >
              {currentStep > index + 1 ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="text-sm font-semibold">{index + 1}</span>
              )}
            </div>
            <div className="ml-3 mr-6">
              <p
                className={`text-sm font-medium ${
                  currentStep >= index + 1 ? 'text-white' : 'text-slate-400'
                }`}
              >
                {step}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-1 mx-2 ${
                  currentStep > index + 1 ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnboardingSteps;
