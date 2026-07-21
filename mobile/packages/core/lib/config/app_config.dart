/// Конфигурация приложения. Значения приходят из окружения сборки
/// (`--dart-define`), с дефолтами под локальный бэкенд из docker-compose.
///
/// Секреты в код не зашиваются: `publishableKey` задаётся при сборке
/// (`--dart-define=MEDUSA_PUBLISHABLE_KEY=...`).
class AppConfig {
  const AppConfig({required this.baseUrl, required this.publishableKey});

  /// Базовый URL Medusa Store API (без завершающего слэша).
  final String baseUrl;

  /// Публикуемый ключ витрины Medusa (`x-publishable-api-key`).
  final String publishableKey;

  /// Собирает конфиг из `--dart-define` переменных окружения сборки.
  factory AppConfig.fromEnvironment() {
    return const AppConfig(
      baseUrl: String.fromEnvironment(
        'MEDUSA_BASE_URL',
        defaultValue: 'http://localhost:9000',
      ),
      publishableKey: String.fromEnvironment(
        'MEDUSA_PUBLISHABLE_KEY',
        defaultValue: '',
      ),
    );
  }
}
