import 'session_store.dart';

/// Хранилище сессии СОТРУДНИКА (admin-учётка) между запусками: токен и email,
/// под которым вошли. Расширяет [SessionStore] почтой, потому что профиля
/// сотрудника в контракте нет (`/admin/users/me` в спеке Store API не
/// публикуется): после перезапуска показать «кто на смене» больше неоткуда.
/// Пароль не хранится никогда.
///
/// Хранилище отдельное от покупательского: на одном устройстве это разные
/// акторы и разные токены — общий ключ означал бы, что вход сборщика выкидывает
/// покупателя. Реализации: `SecureStaffSessionStore` (прод) и
/// `InMemoryStaffSessionStore` (тесты).
abstract interface class StaffSessionStore implements SessionStore {
  /// Email вошедшего сотрудника; null — сессии нет либо запись повреждена.
  Future<String?> readEmail();

  /// Сохраняет email смены рядом с токеном.
  Future<void> writeEmail(String email);
}
