import { Module } from "@medusajs/framework/utils"
import ChatHistoryModuleService from "./service"

export const CHAT_HISTORY_MODULE = "chat_history"

export default Module(CHAT_HISTORY_MODULE, {
  service: ChatHistoryModuleService,
})
