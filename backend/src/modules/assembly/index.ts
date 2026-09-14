import { Module } from "@medusajs/framework/utils"
import AssemblyModuleService from "./service"

// Ключ — assembly: сборка оплаченного заказа по категориям (T10.11).
export const ASSEMBLY_MODULE = "assembly"

export default Module(ASSEMBLY_MODULE, {
  service: AssemblyModuleService,
})
