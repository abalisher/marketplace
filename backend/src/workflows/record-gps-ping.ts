import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  recordGpsPingStep,
  RecordGpsPingStepInput,
} from "./steps/record-gps-ping"

export type RecordGpsPingWorkflowInput = RecordGpsPingStepInput

// Приём GPS-пинга водителя (polling-модель отдачи позиции — без realtime-канала,
// см. docs/modules/logistics.md). Один шаг с компенсацией.
export const recordGpsPingWorkflow = createWorkflow(
  "record-gps-ping",
  (input: WorkflowData<RecordGpsPingWorkflowInput>) => {
    const ping = recordGpsPingStep(input)
    return new WorkflowResponse(ping)
  }
)
