// Денежные поля ядра и bigNumber-поля моделей приходят числом, строкой или
// объектом BigNumber (зависит от пути выборки) — приводим к числу в одном
// месте, чтобы на экран и в расчёт не уехало NaN.
export const numericAmount = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }
  if (typeof value === "object") {
    const numeric = (value as { numeric?: unknown }).numeric
    if (typeof numeric === "number" && Number.isFinite(numeric)) {
      return numeric
    }
    const inner = (value as { value?: unknown }).value
    if (inner !== undefined) {
      return numericAmount(inner)
    }
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}
