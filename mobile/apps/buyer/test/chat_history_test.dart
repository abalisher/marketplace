import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:marketplace_buyer/features/assistant/data/shared_prefs_chat_history_store.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_conversation.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_message.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_role.dart';
import 'package:marketplace_buyer/features/assistant/providers/chat_history_controller.dart';
import 'package:marketplace_buyer/features/assistant/providers/chat_history_store_provider.dart';

ChatConversation _conv(String id, String title, DateTime at) =>
    ChatConversation(
      id: id,
      title: title,
      updatedAt: at,
      messages: [
        ChatMessage(role: ChatRole.user, content: title),
        const ChatMessage(role: ChatRole.assistant, content: 'ответ'),
      ],
      cartId: 'cart_$id',
    );

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  test(
    'store: сохранённые диалоги переживают перезапуск (round-trip JSON)',
    () async {
      final prefs = await SharedPreferences.getInstance();
      final store = SharedPrefsChatHistoryStore(prefs);

      await store.save([
        _conv('1', 'Цемент на стяжку', DateTime(2026, 7, 28, 10)),
      ]);

      // Новый store поверх тех же prefs — как перезапуск приложения.
      final restored = await SharedPrefsChatHistoryStore(prefs).load();
      expect(restored, hasLength(1));
      expect(restored.single.title, 'Цемент на стяжку');
      expect(restored.single.cartId, 'cart_1');
      expect(restored.single.messages, hasLength(2));
      expect(restored.single.messages.first.role, ChatRole.user);
    },
  );

  test('store: битый JSON → пустая история (не падаем)', () async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('assistant_chat_history_v1', '{не json');
    final restored = await SharedPrefsChatHistoryStore(prefs).load();
    expect(restored, isEmpty);
  });

  test('store: одна битая запись теряет только её, не всю историю', () async {
    final prefs = await SharedPreferences.getInstance();
    // Первая запись без обязательного id (битая), вторая — валидная.
    await prefs.setString(
      'assistant_chat_history_v1',
      '[{"title":"без id"},'
          '{"id":"ok","title":"Цемент","updated_at":"2026-07-28T10:00:00.000",'
          '"messages":[{"role":"user","content":"Цемент"}]}]',
    );
    final restored = await SharedPrefsChatHistoryStore(prefs).load();
    expect(restored, hasLength(1));
    expect(restored.single.id, 'ok');
  });

  test('controller: upsert обновляет по id и держит свежие сверху', () async {
    final prefs = await SharedPreferences.getInstance();
    final container = ProviderContainer(
      overrides: [sharedPreferencesProvider.overrideWithValue(prefs)],
    );
    addTearDown(container.dispose);

    // Дожидаемся первичной загрузки (пустой).
    await container.read(chatHistoryControllerProvider.future);
    final ctrl = container.read(chatHistoryControllerProvider.notifier);

    await ctrl.upsert(_conv('a', 'Первый', DateTime(2026, 7, 28, 9)));
    await ctrl.upsert(_conv('b', 'Второй', DateTime(2026, 7, 28, 11)));
    // Обновляем 'a' более свежим временем — должен всплыть наверх, без дубля.
    await ctrl.upsert(_conv('a', 'Первый изменён', DateTime(2026, 7, 28, 12)));

    final list = container.read(chatHistoryControllerProvider).value!;
    expect(list, hasLength(2));
    expect(list.first.id, 'a');
    expect(list.first.title, 'Первый изменён');

    // Персистентность: перечитываем из хранилища.
    final reloaded = await SharedPrefsChatHistoryStore(prefs).load();
    expect(reloaded, hasLength(2));
  });

  test('controller: remove удаляет диалог и персистит', () async {
    final prefs = await SharedPreferences.getInstance();
    final container = ProviderContainer(
      overrides: [sharedPreferencesProvider.overrideWithValue(prefs)],
    );
    addTearDown(container.dispose);
    await container.read(chatHistoryControllerProvider.future);
    final ctrl = container.read(chatHistoryControllerProvider.notifier);

    await ctrl.upsert(_conv('a', 'Первый', DateTime(2026, 7, 28, 9)));
    await ctrl.upsert(_conv('b', 'Второй', DateTime(2026, 7, 28, 11)));
    await ctrl.remove('a');

    final list = container.read(chatHistoryControllerProvider).value!;
    expect(list.map((c) => c.id), ['b']);
    final reloaded = await SharedPrefsChatHistoryStore(prefs).load();
    expect(reloaded.map((c) => c.id), ['b']);
  });

  test('controller: rename задаёт имя, и upsert его не перетирает', () async {
    final prefs = await SharedPreferences.getInstance();
    final container = ProviderContainer(
      overrides: [sharedPreferencesProvider.overrideWithValue(prefs)],
    );
    addTearDown(container.dispose);
    await container.read(chatHistoryControllerProvider.future);
    final ctrl = container.read(chatHistoryControllerProvider.notifier);

    await ctrl.upsert(_conv('a', 'Нужен цемент', DateTime(2026, 8, 26, 9)));
    await ctrl.rename('a', '  Стяжка в подвале  ');

    // Имя обрезано и помечено как заданное покупателем.
    var saved = await SharedPrefsChatHistoryStore(prefs).load();
    expect(saved.single.title, 'Стяжка в подвале');
    expect(saved.single.titleCustom, isTrue);

    // Следующий ход диалога (автозаголовок по первой реплике) имя не меняет.
    await ctrl.upsert(_conv('a', 'Нужен цемент', DateTime(2026, 8, 26, 10)));
    saved = await SharedPrefsChatHistoryStore(prefs).load();
    expect(saved.single.title, 'Стяжка в подвале');
    expect(saved.single.titleCustom, isTrue);

    // Пустое имя = отмена ввода, прежнее название остаётся.
    await ctrl.rename('a', '   ');
    saved = await SharedPrefsChatHistoryStore(prefs).load();
    expect(saved.single.title, 'Стяжка в подвале');
  });

  test('conversation: поиск идёт по названию и по тексту реплик', () {
    final c = _conv('a', 'Цемент на стяжку', DateTime(2026, 8, 26, 9));
    expect(c.matches(''), isTrue);
    expect(c.matches('ЦЕМЕНТ'), isTrue); // регистр не важен
    expect(c.matches('ответ'), isTrue); // текст реплики ассистента
    expect(c.matches('кирпич'), isFalse);
  });

  test('store: переименованное название переживает перезапуск', () async {
    final prefs = await SharedPreferences.getInstance();
    final store = SharedPrefsChatHistoryStore(prefs);
    await store.save([
      _conv('a', 'Нужен цемент', DateTime(2026, 8, 26, 9)).renamed('Подвал'),
    ]);
    final restored = await SharedPrefsChatHistoryStore(prefs).load();
    expect(restored.single.title, 'Подвал');
    expect(restored.single.titleCustom, isTrue);
  });
}
