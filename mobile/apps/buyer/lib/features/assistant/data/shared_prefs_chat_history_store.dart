import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../domain/chat_conversation.dart';
import 'chat_history_store.dart';

/// Реализация [ChatHistoryStore] поверх shared_preferences: весь список диалогов
/// сериализуется в один JSON под ключом [_key]. Объём истории покупателя
/// невелик (тексты реплик), отдельная БД не нужна. Битый/отсутствующий JSON →
/// пустая история (не роняем приложение).
class SharedPrefsChatHistoryStore implements ChatHistoryStore {
  SharedPrefsChatHistoryStore(this._prefs);

  final SharedPreferences _prefs;

  static const _key = 'assistant_chat_history_v1';

  @override
  Future<List<ChatConversation>> load() async {
    final raw = _prefs.getString(_key);
    if (raw == null || raw.isEmpty) return const [];
    final List<dynamic> decoded;
    try {
      decoded = jsonDecode(raw) as List;
    } catch (_) {
      // Битый верхнеуровневый JSON — истории нет (не роняем приложение).
      return const [];
    }
    // Разбираем ПОКОРДОВО: одна повреждённая запись (или дрейф схемы) теряет
    // ОДИН диалог, а не всю историю (ревью T2.5).
    final result = <ChatConversation>[];
    for (final item in decoded.whereType<Map<String, dynamic>>()) {
      try {
        result.add(ChatConversation.fromJson(item));
      } catch (_) {
        // пропускаем битую запись
      }
    }
    return result;
  }

  @override
  Future<void> save(List<ChatConversation> conversations) async {
    final raw = jsonEncode(conversations.map((c) => c.toJson()).toList());
    await _prefs.setString(_key, raw);
  }
}
