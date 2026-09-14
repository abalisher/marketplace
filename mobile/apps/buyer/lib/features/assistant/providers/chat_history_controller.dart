import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/chat_conversation.dart';
import 'chat_history_store_provider.dart';

/// Контроллер локальной истории диалогов (T2.5). Держит список сохранённых
/// диалогов (свежие сверху), читает/пишет их через [ChatHistoryStore]. Бэкенд
/// stateless — вся история на устройстве. Диалог сохраняется по мере ведения
/// (upsert из [ChatController]) и удаляется вручную из панели.
class ChatHistoryController extends AsyncNotifier<List<ChatConversation>> {
  @override
  Future<List<ChatConversation>> build() async {
    final store = ref.watch(chatHistoryStoreProvider);
    // load() может вернуть неизменяемый const [] — копируем перед сортировкой.
    final list = [...await store.load()]
      ..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
    return list;
  }

  /// Вставляет или обновляет диалог по id и персистит. Возвращает сразу —
  /// запись в хранилище идёт следом (список в состоянии обновляется синхронно,
  /// UI не ждёт диск).
  ///
  /// Название, заданное покупателем (`titleCustom`), автозаголовок по первой
  /// реплике НЕ перетирает: сохраняем прежнее имя (T10.1c).
  Future<void> upsert(ChatConversation conversation) async {
    // Дожидаемся первичной загрузки, иначе её отложенное завершение затрёт нашу
    // запись (гонка build() ↔ upsert при первом обращении к провайдеру).
    final current = await future;
    final existing = current.where((c) => c.id == conversation.id).firstOrNull;
    final incoming = existing != null && existing.titleCustom
        ? conversation.renamed(existing.title)
        : conversation;
    final next = [incoming, ...current.where((c) => c.id != incoming.id)]
      ..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
    state = AsyncData(next);
    await ref.read(chatHistoryStoreProvider).save(next);
  }

  /// Переименовывает диалог. Пустое имя игнорируем — покупатель отменил ввод.
  Future<void> rename(String id, String title) async {
    final trimmed = title.trim();
    if (trimmed.isEmpty) return;
    final current = await future;
    final next = [for (final c in current) c.id == id ? c.renamed(trimmed) : c];
    state = AsyncData(next);
    await ref.read(chatHistoryStoreProvider).save(next);
  }

  /// Удаляет диалог по id и персистит.
  Future<void> remove(String id) async {
    final current = await future;
    final next = current.where((c) => c.id != id).toList();
    state = AsyncData(next);
    await ref.read(chatHistoryStoreProvider).save(next);
  }
}

final chatHistoryControllerProvider =
    AsyncNotifierProvider<ChatHistoryController, List<ChatConversation>>(
      ChatHistoryController.new,
    );
