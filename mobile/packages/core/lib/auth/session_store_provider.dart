import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'secure_session_store.dart';
import 'session_store.dart';

/// Провайдер хранилища сессии. По умолчанию — персистентное
/// ([SecureSessionStore] на flutter_secure_storage): токен переживает
/// перезапуск приложения (T8.1). В тестах переопределяется фейком в памяти.
final sessionStoreProvider = Provider<SessionStore>(
  (ref) => SecureSessionStore(),
);
