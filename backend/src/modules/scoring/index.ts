import { Module } from "@medusajs/framework/utils"
import ScoringModuleService from "./service"

export const SCORING_MODULE = "scoring"

export default Module(SCORING_MODULE, {
  service: ScoringModuleService,
})
