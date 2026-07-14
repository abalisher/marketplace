import { defineConfig } from "eslint/config"
import medusa from "@medusajs/eslint-plugin"

export default defineConfig([
  ...medusa.configs.recommended,
  {
    rules: {
      // Баг правила на Windows (@medusajs/eslint-plugin 2.16): moduleRoot оно
      // нормализует в '/', а path.resolve импорта возвращает '\', поэтому ЛЮБАЯ
      // внутримодульная связь (belongsTo/hasMany между моделями одного модуля)
      // ложно считается кросс-модульной. Само правило кросс-модульных связей
      // остаётся в силе (см. backend/CLAUDE.md) — вернуть после фикса upstream.
      "@medusajs/link-no-cross-module-relationship": "off",
    },
  },
])
