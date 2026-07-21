import { Module } from "@medusajs/framework/utils"
import EstimatorModuleService from "./service"

export const ESTIMATOR_MODULE = "estimator"

export default Module(ESTIMATOR_MODULE, {
  service: EstimatorModuleService,
})
