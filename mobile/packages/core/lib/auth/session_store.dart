/// Хранилище токена сессии между запусками приложения. Абстракция: реализация
/// по умолчанию — персистентная (`SecureSessionStore` на
/// `flutter_secure_storage`, T8.1); в памяти ([InMemorySessionStore]) — для
/// тестов. Репозиторий/контроллер работают только через этот интерфейс.
abstract interface class SessionStore {
  /// Возвращает сохранённый токен либо null, если сессии нет.
  Future<String?> readToken();

  /// Сохраняет токен сессии.
  Future<void> writeToken(String token);

  /// Стирает сохранённую сессию (выход).
  Future<void> clear();
}
