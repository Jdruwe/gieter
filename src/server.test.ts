// Minimal worker entrypoint for testing — exports only the workflow.
// Does not import @tanstack/react-start which requires virtual module
// resolution that is unavailable outside the full app build.
export { ImportPlantWorkflow } from "@/workflows/import-plant"
