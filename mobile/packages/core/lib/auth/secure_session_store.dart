import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'session_store.dart';

/// Персистентная реализация [SessionStore] на `flutter_secure_storage` (T8.1):
/// токен сессии переживает перезапуск приложения (Keychain на iOS, Encrypted
/// SharedPreferences на Android, шифрованный localStorage на web — на вебе это
/// обфускация, не аппаратный секрет). Ключ один — токен покупателя; при выходе
/// стирается. Заменяет [InMemorySessionStore] в проде без изменений в
/// репозитории/контроллере авторизации.
class SecureSessionStore implements SessionStore {
  SecureSessionStore([FlutterSecureStorage? storage])
    : _storage = storage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  static const _tokenKey = 'buyer_session_token';

  /// На Android — EncryptedSharedPreferences (иначе легаси KeyStore-режим).
  static const _androidOptions = AndroidOptions(
    encryptedSharedPreferences: true,
  );

  /// iOS/macOS: токен не покидает устройство (не в бэкапах, не мигрирует при
  /// восстановлении на другое устройство), доступен фону после первой
  /// разблокировки. Единый для всех трёх операций — иначе чтение/запись
  /// разошлись бы по разным записям Keychain.
  static const _iosOptions = IOSOptions(
    accessibility: KeychainAccessibility.first_unlock_this_device,
  );

  @override
  Future<String?> readToken() async {
    // Повреждённое/недоступное хранилище (сбой расшифровки после restore из
    // бэкапа, инвалидация ключа KeyStore, ошибка Keychain) НЕ должно ронять
    // старт приложения: чистим битую запись и трактуем как гостя.
    try {
      return await _storage.read(
        key: _tokenKey,
        aOptions: _androidOptions,
        iOptions: _iosOptions,
      );
    } catch (_) {
      await _safeClear();
      return null;
    }
  }

  @override
  Future<void> writeToken(String token) => _storage.write(
    key: _tokenKey,
    value: token,
    aOptions: _androidOptions,
    iOptions: _iosOptions,
  );

  @override
  Future<void> clear() => _storage.delete(
    key: _tokenKey,
    aOptions: _androidOptions,
    iOptions: _iosOptions,
  );

  /// Очистка, которая сама не бросает (используется при восстановлении из
  /// повреждённого состояния — не даём ошибке чистки маскировать гостя).
  Future<void> _safeClear() async {
    try {
      await clear();
    } catch (_) {
      // хранилище недоступно — оставляем как есть, вернём гостя
    }
  }
}
