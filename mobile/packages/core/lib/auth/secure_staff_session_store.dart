import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'staff_session_store.dart';

/// Персистентная реализация [StaffSessionStore] на `flutter_secure_storage`:
/// токен смены и email переживают перезапуск приложения. Ключи свои
/// (`staff_*`), покупательские записи не трогаются.
class SecureStaffSessionStore implements StaffSessionStore {
  SecureStaffSessionStore([FlutterSecureStorage? storage])
    : _storage = storage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  static const _tokenKey = 'staff_session_token';
  static const _emailKey = 'staff_session_email';

  /// На Android — EncryptedSharedPreferences (иначе легаси KeyStore-режим).
  static const _androidOptions = AndroidOptions(
    encryptedSharedPreferences: true,
  );

  /// iOS/macOS: складской телефон общий, но токен смены не должен уезжать в
  /// бэкапы и на другое устройство — та же политика, что у покупателя.
  static const _iosOptions = IOSOptions(
    accessibility: KeychainAccessibility.first_unlock_this_device,
  );

  @override
  Future<String?> readToken() => _read(_tokenKey);

  @override
  Future<String?> readEmail() => _read(_emailKey);

  @override
  Future<void> writeToken(String token) => _write(_tokenKey, token);

  @override
  Future<void> writeEmail(String email) => _write(_emailKey, email);

  @override
  Future<void> clear() async {
    await _delete(_tokenKey);
    await _delete(_emailKey);
  }

  /// Чтение, которое не роняет старт приложения: повреждённое хранилище (сбой
  /// расшифровки после restore, инвалидация ключа KeyStore) трактуем как
  /// «сессии нет» и чистим битую запись — идиома `SecureSessionStore`.
  Future<String?> _read(String key) async {
    try {
      return await _storage.read(
        key: key,
        aOptions: _androidOptions,
        iOptions: _iosOptions,
      );
    } catch (_) {
      await _delete(key);
      return null;
    }
  }

  Future<void> _write(String key, String value) => _storage.write(
    key: key,
    value: value,
    aOptions: _androidOptions,
    iOptions: _iosOptions,
  );

  Future<void> _delete(String key) async {
    try {
      await _storage.delete(
        key: key,
        aOptions: _androidOptions,
        iOptions: _iosOptions,
      );
    } catch (_) {
      // Хранилище недоступно — считаем сессию отсутствующей, старт не роняем.
    }
  }
}
