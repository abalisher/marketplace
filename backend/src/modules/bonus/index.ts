import { Module } from "@medusajs/framework/utils"
import BonusModuleService from "./service"

// Ключ bonus свободен — в реестре ядра такого модуля нет (проверено зондом).
export const BONUS_MODULE = "bonus"

export default Module(BONUS_MODULE, {
  service: BonusModuleService,
})
