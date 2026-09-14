import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../data/chat_history_store.dart';
import '../data/shared_prefs_chat_history_store.dart';

/// Провайдер локального хранилища истории диалогов. По умолчанию —
/// shared_preferences; в тестах переопределяется фейком в памяти.
///
/// Инстанс SharedPreferences предоставляется через [sharedPreferencesProvider]
/// — он переопределяется в `main()` реальным значением из `getInstance()`
/// (идиома «провайдер-заглушка + override на старте», как session store в core).
final chatHistoryStoreProvider = Provider<ChatHistoryStore>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return SharedPrefsChatHistoryStore(prefs);
});

/// Провайдер экземпляра SharedPreferences. По умолчанию бросает — обязателен
/// override в `main()` (реальный инстанс) или в тестах (фейк).
final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError(
    'sharedPreferencesProvider must be overridden in main() or tests',
  );
});
