/// Конфигурация приложения. Значения приходят из окружения сборки
/// (`--dart-define`), с дефолтами под локальный бэкенд из docker-compose.
///
/// Секреты в код не зашиваются: `publishableKey` задаётся при сборке
/// (`--dart-define=MEDUSA_PUBLISHABLE_KEY=...`).
class AppConfig {
  const AppConfig({
    required this.baseUrl,
    required this.publishableKey,
    this.featureCompanies = false,
  });

  /// Базовый URL Medusa Store API (без завершающего слэша).
  final String baseUrl;

  /// Публикуемый ключ витрины Medusa (`x-publishable-api-key`).
  final String publishableKey;

  /// Юрлица: раздел «Компания», заявка и статус модерации (T10.9).
  ///
  /// На MVP выключен — магазин оформляет заказы только на физлиц, и роуты
  /// компаний на бэкенде отвечают 404. Значение обязано совпадать с
  /// `FEATURE_COMPANIES` бэкенда: приложение собирается заранее и его env не
  /// видит. Возврат раздела — пересборка с
  /// `--dart-define=FEATURE_COMPANIES=true`.
  final bool featureCompanies;

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
      featureCompanies: bool.fromEnvironment('FEATURE_COMPANIES'),
    );
  }
}
