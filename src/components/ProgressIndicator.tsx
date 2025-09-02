import { CheckCircle, Circle, Loader2 } from 'lucide-react';

export type ProgressStep = 
  | 'User Query' 
  | 'Transforming Query' 
  | 'Data Extraction' 
  | 'Data Processing' 
  | 'Output';


interface ProgressIndicatorProps {
  currentStep: ProgressStep | null;
  completedSteps: ProgressStep[];
  progressTexts?: Partial<Record<ProgressStep, string>>;
}

const steps: ProgressStep[] = [
  'User Query',
  'Transforming Query',
  'Data Extraction',
  'Data Processing',
  'Output'
];

const outputStageIndicators = ['ask_python_result_verification', 'completed'];

export function ProgressIndicator({ currentStep, completedSteps, progressTexts = {} }: ProgressIndicatorProps) {
  
const getStepStatus = (step: ProgressStep) => {
  if (step === 'Output') {
    if (outputStageIndicators.includes(currentStep as string)) {
      return 'completed';
    } else if (currentStep === 'Output') {
      return 'current';
    } else {
      return 'pending';
    }
  }

  if (completedSteps.includes(step)) return 'completed';
  if (currentStep === step) return 'current';
  return 'pending';
};

  return (
    <div className="w-64 bg-card border-l border-border p-4">
      <h3 className="text-sm font-medium text-foreground mb-4">Analysis Progress</h3>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step);
          const isLast = index === steps.length - 1;

          return (
            <div key={step} className="relative">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  {status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : status === 'current' ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}

                  {!isLast && (
                    <div
                      className={`w-px h-8 mt-2 ${
                        status === 'completed' ? 'bg-success' : 'bg-muted-foreground/30'
                      }`}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      status === 'completed'
                        ? 'text-success'
                        : status === 'current'
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step}
                  </p>

                  {(status === 'current' || status === 'completed') &&
                    progressTexts[step] && (
                      <p className="text-xs text-muted-foreground mt-1 animate-fade-in">
                        {progressTexts[step]}
                      </p>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
