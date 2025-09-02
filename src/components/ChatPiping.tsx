import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

interface ChatPipingProps {
  currentStage: string;
}

const PipeData = [
  { 
    title: "User Query", 
    metaData: ["start", "connected", "process_initial_query"] 
  },
  {
    title: "Transforming Query",
    metaData: [
        "find_relevant_feedback",
        "get_game_name",
        "get_events_node",
        "ask_for_event_verification",
        "process_event_verification",
        "get_TQ_node",
        "ask_for_TQ_verification",
        "process_TQ_verification",
        "verify_info",
        "ask_for_missing_info",
        "process_verify_info_response"
    ],
  },
  {
    title: "Data Extraction", 
    metaData: [
      "generate_jql",
      "ask_for_jql_verification",
      "process_jql_verification", 
      "save_jql_feedback",
      "run_jql",
      "handle_jql_error",
      "process_jql_error_feedback",
    ],
  },
  {
    title: "Data Processing",
    metaData: ["generate_python_code", "execute_python_code"],
  },
  {
    title: "Output",
    metaData: [
      "ask_python_result_verification",
      "process_python_result_feedback",
    ],
  },
];

const steps = [
  'User Query',
  'Transforming Query',
  'Data Extraction',
  'Data Processing',
  'Output'
];

export function ChatPiping({ currentStage }: ChatPipingProps) {
  // Clean incoming stage data (removes brackets, apostrophes, commas)
  const cleanStage = currentStage?.replace(/[()',]/g, '') || currentStage;

  // Validate if the stage exists in any pipeline stage
  const currentIndex = PipeData.findIndex((stage) => 
    stage.metaData.includes(cleanStage)
  );

  // Initialize with valid stage or default to "start"
  const [lastValidStage, setLastValidStage] = useState(
    PipeData.some((s) => s.metaData.includes(cleanStage)) ? cleanStage : "start"
  );

  // Only update lastValidStage if the current stage is valid
  useEffect(() => {
    if (currentIndex !== -1) {
      setLastValidStage(cleanStage);
    }
    console.log("currentStage", currentStage);
    console.log("typeof currentStage", typeof currentStage);
  }, [currentStage, currentIndex, cleanStage]);

  const activeIndex = PipeData.findIndex((stage) =>
    stage.metaData.includes(lastValidStage)
  );

  // Check if we've reached the final stages
  const isFinalStageReached = cleanStage === "ask_python_result_verification" || 
                             cleanStage === "process_python_result_feedback" || 
                             cleanStage === "completed";

  const getStepStatus = (step: string) => {
    const stepIndex = steps.indexOf(step);
    
    if (step === 'Output') {
      if (isFinalStageReached) {
        return 'completed';
      } else if (stepIndex === activeIndex) {
        return 'current';
      } else {
        return 'pending';
      }
    }

    if (stepIndex < activeIndex) return 'completed';
    if (stepIndex === activeIndex) return 'current';
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

                  {status === 'current' && (
                    <p className="text-xs text-muted-foreground mt-1 animate-fade-in">
                      Working on {step}...
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