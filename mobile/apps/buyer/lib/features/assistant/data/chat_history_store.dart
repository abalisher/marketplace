import '../domain/chat_conversation.dart';

/// Граница локального хранилища истории диалогов (T2.5). Провайдер/контроллер
/// не знают про конкретный бэкенд хранения (shared_preferences) — работают через
/// эту абстракцию (в тестах — фейк в памяти).
abstract interface class ChatHistoryStore {
  /// Все сохранённые диалоги (порядок не гарантирован — сортирует вызывающий).
  Future<List<ChatConversation>> load();

  /// Полностью перезаписывает список сохранённых диалогов.
  Future<void> save(List<ChatConversation> conversations);
}
