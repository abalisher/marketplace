# contracts/ — контракт API (мост TypeScript ↔ Dart)

`openapi.json` — автогенерируемая OpenAPI-спека REST API бэкенда. Единственный источник правды
для мобильных приложений: `mobile/packages/api_client` кодогенерится отсюда.

Правила:
- Файл НЕ редактируется руками — только регенерация из бэкенда.
- Изменил API в `backend/` → в той же сессии перегенерируй спеку и Dart-клиент (команды — в корневом CLAUDE.md).
- Агентам mobile: читать эту спеку вместо TypeScript-кода. Агентам backend: не читать Dart.

Генерация: `cd backend && npm run contract:generate` (`backend/scripts/generate-contract.mjs`) —
официальная спека Medusa v2 Store API + мердж фрагментов кастомных роутов `backend/src/api/**/*.oas.json`
+ нормализации для Dart-кодогена (см. комментарии в скрипте: $-фильтры, nullable-композиции,
битые default, object-параметры query, required у requestBody).
Dart-кодоген: `cd mobile/packages/api_client && dart run swagger_parser && dart run build_runner build --delete-conflicting-outputs && dart format .`
