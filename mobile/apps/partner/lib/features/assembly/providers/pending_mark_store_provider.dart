import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../data/pending_mark_store.dart';
import '../data/shared_prefs_pending_mark_store.dart';

/// Провайдер экземпляра SharedPreferences. По умолчанию бросает — обязателен
/// override в `main()` (реальный инстанс) или в тестах (фейк). Идиома buyer:
/// синхронные читатели не должны ждать диск.
final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError(
    'sharedPreferencesProvider must be overridden in main() or tests',
  );
});

/// Провайдер очереди неотправленных отметок. В тестах переопределяется фейком
/// в памяти.
final pendingMarkStoreProvider = Provider<PendingMarkStore>((ref) {
  return SharedPrefsPendingMarkStore(ref.watch(sharedPreferencesProvider));
});
