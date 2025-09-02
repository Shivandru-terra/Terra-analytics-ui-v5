# ChatPiping Component Documentation

## Overview

The `ChatPiping` component is a **real-time progress tracker** that visualizes the current stage of an AI analytics pipeline. It displays a vertical timeline showing users where they are in the data analysis process, with visual indicators for completed, active, and pending stages.

## Core Functionality

### Purpose
- **Visual Progress Tracking**: Shows the current stage of AI data analysis pipeline
- **Real-time Updates**: Responds to backend status changes via WebSocket
- **User Experience**: Provides clear visual feedback about the analysis progress
- **Stage Categorization**: Maps multiple backend status codes to logical pipeline stages

## Component Structure

### Pipeline Stages Definition

The component defines 5 main stages of the analytics pipeline:

```typescript
const PipeData = [
  { 
    title: "User Query", 
    metaData: ["start", "connected", "process_initial_query"] 
  },
  {
    title: "Transforming Query",
    metaData: [
      "ask_for_query_verification",
      "process_query_verification", 
      "find_relevant_feedback",
      "get_game_name",
      "translate_query",
      "verify_info",
      "ask_for_missing_info",
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
```

### Stage Mapping Logic

Each stage contains multiple backend status codes (`metaData`) that map to that particular phase. This design allows:

- **Categorization**: Any backend status is mapped to the appropriate pipeline stage
- **Progress Tracking**: Multiple operations within the same logical stage are grouped
- **Error Handling**: Different status codes for the same stage (e.g., error handling, verification steps)

## State Management Logic

### Input Processing

```typescript
// Clean incoming stage data (removes brackets, apostrophes, commas)
const cleanStage = currentStage?.replace(/[()',]/g, '') || currentStage;

// Validate if the stage exists in any pipeline stage
const currentIndex = PipeData.findIndex((stage) => 
  stage.metaData.includes(cleanStage)
);
```

### State Persistence

```typescript
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
```

### Active Stage Calculation

```typescript
const activeIndex = PipeData.findIndex((stage) =>
  stage.metaData.includes(lastValidStage)
);
```

## Visual State Logic

### Stage Status Determination

```typescript
// Check if we've reached the final stages
const isFinalStageReached = cleanStage === "ask_python_result_verification" || 
                           cleanStage === "process_python_result_feedback" || 
                           cleanStage === "completed";

// Determine if this stage is currently active
const isActive = index === activeIndex;

// Determine if this stage is completed
const isCompleted = index < activeIndex || (isFinalStageReached && index === PipeData.length - 1);

// Check if this is the last stage
const isLast = index === PipeData.length - 1;
```

### Visual Indicators

The component uses different visual states for each stage:

- **Green dot with ✓**: Completed stages
- **Blue dot with ○**: Currently active stage  
- **Gray dot with ○**: Future/pending stages
- **Special case**: Final stage gets green when `isFinalStageReached` is true

```typescript
const dotColor =
  isFinalStageReached && isLast
    ? "bg-green-500"
    : isActive
    ? "bg-blue-500"
    : isCompleted
    ? "bg-green-500"
    : "bg-slate-400 dark:bg-slate-600";
```

## Data Flow

### Input
- **Prop**: `currentStage` (string) from parent component
- **Source**: `status?.step || status?.status || ""` from SocketContext
- **Backend**: Status updates sent via WebSocket

### Output
Visual timeline showing:
- Stage titles
- Current stage indicator
- Progress completion
- Current backend status code (when active)

## Integration Requirements

### Backend Status Codes Expected

The component expects these status codes from your backend:

#### User Query Stage
- `start`
- `connected` 
- `process_initial_query`

#### Transforming Query Stage
- `ask_for_query_verification`
- `process_query_verification`
- `find_relevant_feedback`
- `get_game_name`
- `translate_query`
- `verify_info`
- `ask_for_missing_info`

#### Data Extraction Stage
- `generate_jql`
- `ask_for_jql_verification`
- `process_jql_verification`
- `save_jql_feedback`
- `run_jql`
- `handle_jql_error`
- `process_jql_error_feedback`

#### Data Processing Stage
- `generate_python_code`
- `execute_python_code`

#### Output Stage
- `ask_python_result_verification`
- `process_python_result_feedback`
- `completed`

### Required Dependencies

1. **WebSocket Connection**: Same backend status updates (`status.step` or `status.status`)
2. **State Management**: React hooks for state management
3. **Styling**: Tailwind CSS classes for visual styling
4. **Context**: SocketContext for real-time status updates

## Key Logic Patterns for Replication

### 1. Stage Validation
```typescript
// Always validate incoming stages before processing
const isValidStage = PipeData.some(stage => stage.metaData.includes(cleanStage));
```

### 2. Progress Calculation
```typescript
// Calculate which stages are completed based on current position
const isCompleted = index < activeIndex || (isFinalStageReached && index === PipeData.length - 1);
```

### 3. State Persistence
```typescript
// Only update state when receiving valid stages
if (currentIndex !== -1) {
  setLastValidStage(cleanStage);
}
```

### 4. Final Stage Detection
```typescript
// Special handling for completion states
const isFinalStageReached = cleanStage === "ask_python_result_verification" || 
                           cleanStage === "process_python_result_feedback" || 
                           cleanStage === "completed";
```

## Component Props

```typescript
interface ChatPipingProps {
  currentStage: string; // The current stage from backend
}
```

## Usage Example

```typescript
import { ChatPiping } from './ChatPiping';

// In parent component
const safeStage = status?.step || status?.status || "";

<ChatPiping currentStage={safeStage} />
```

## Styling Classes

The component uses these Tailwind CSS classes:

- **Container**: `w-[20rem] max-w-[20rem] h-auto p-6 flex flex-col dark:bg-slate-800/40`
- **Timeline Line**: `absolute left-2 top-4 h-full w-px border border-dashed border-slate-300 dark:border-slate-600`
- **Dot**: `absolute left-0 top-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs`
- **Stage Title**: `text-sm font-medium`
- **Status Code**: `text-xs text-slate-400 dark:text-slate-500 mt-1`

## Customization Notes

### Backend-Agnostic Design
The component is designed to be **backend-agnostic**. You can modify the `metaData` arrays to match your specific backend status codes while keeping the same visual logic.

### Adding New Stages
To add new stages:
1. Add new object to `PipeData` array
2. Include all relevant backend status codes in `metaData`
3. Update final stage detection logic if needed

### Modifying Visual Indicators
To change visual indicators:
1. Modify the `dotColor` logic
2. Update the icon/symbol logic (`✓` vs `○`)
3. Adjust Tailwind classes for styling

## Error Handling

The component includes several error handling mechanisms:

1. **Input Sanitization**: Removes problematic characters from stage names
2. **Default Fallback**: Uses "start" as default when no valid stage is provided
3. **State Validation**: Only updates state with valid stages
4. **Graceful Degradation**: Shows appropriate visual state even with invalid input

## Performance Considerations

1. **Memoization**: Consider memoizing the component if it re-renders frequently
2. **State Updates**: Only updates state when necessary (valid stage changes)
3. **Console Logging**: Remove console.log statements in production
4. **Rendering**: Efficient rendering with conditional logic

## Testing Considerations

When testing this component:

1. **Valid Stages**: Test with all expected backend status codes
2. **Invalid Stages**: Test with unexpected or malformed stage names
3. **State Transitions**: Test stage progression through the pipeline
4. **Final States**: Test completion and final stage detection
5. **Edge Cases**: Test with empty strings, null values, special characters