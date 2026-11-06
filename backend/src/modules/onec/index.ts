import { Module } from "@medusajs/framework/utils"
import OnecModuleService from "./service"

export const ONEC_MODULE = "onec"

export default Module(ONEC_MODULE, {
  service: OnecModuleService,
})
