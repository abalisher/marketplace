import 'staff_session_store.dart';

/// Реализация [StaffSessionStore] в памяти — для ТЕСТОВ (сессия не переживает
/// перезапуск). В проде подключён `SecureStaffSessionStore` через
/// [staffSessionStoreProvider].
class InMemoryStaffSessionStore implements StaffSessionStore {
  String? _token;
  String? _email;

  @override
  Future<String?> readToken() async => _token;

  @override
  Future<String?> readEmail() async => _email;

  @override
  Future<void> writeToken(String token) async => _token = token;

  @override
  Future<void> writeEmail(String email) async => _email = email;

  @override
  Future<void> clear() async {
    _token = null;
    _email = null;
  }
}
