import 'session_store.dart';

/// Реализация [SessionStore] в памяти — для ТЕСТОВ (токен не переживает
/// перезапуск). В проде подключён `SecureSessionStore` на
/// `flutter_secure_storage` (T8.1) через [sessionStoreProvider].
class InMemorySessionStore implements SessionStore {
  String? _token;

  @override
  Future<String?> readToken() async => _token;

  @override
  Future<void> writeToken(String token) async => _token = token;

  @override
  Future<void> clear() async => _token = null;
}
