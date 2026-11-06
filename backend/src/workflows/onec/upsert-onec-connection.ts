import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  upsertOnecConnectionStep,
  UpsertOnecConnectionStepInput,
} from "./steps"

// Сохранить подключение компании к 1С (адрес, логин, пароль, расписание).
// Пароль шифруется в шаге и наружу не возвращается.
export const upsertOnecConnectionWorkflow = createWorkflow(
  "upsert-onec-connection",
  (input: WorkflowData<UpsertOnecConnectionStepInput>) => {
    const connection = upsertOnecConnectionStep(input)
    return new WorkflowResponse(connection)
  }
)
