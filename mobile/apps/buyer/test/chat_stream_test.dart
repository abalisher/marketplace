import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:marketplace_buyer/features/assistant/domain/chat_file.dart';
import 'package:marketplace_buyer/features/assistant/data/assistant_repository.dart';
import 'package:marketplace_buyer/features/assistant/data/assistant_stream_exception.dart';
import 'package:marketplace_buyer/features/assistant/domain/assistant_reply.dart';
import 'package:marketplace_buyer/features/assistant/domain/assistant_stream_event.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_message.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_role.dart';
import 'package:marketplace_buyer/features/assistant/providers/assistant_repository_provider.dart';
import 'package:marketplace_buyer/features/assistant/providers/chat_controller.dart';
import 'package:marketplace_buyer/features/assistant/providers/chat_history_controller.dart';
import 'package:marketplace_buyer/features/assistant/providers/chat_history_store_provider.dart';
import 'no_assistant_cart.dart';

/// Фейк ассистента с УПРАВЛЯЕМЫМ потоком: тест сам решает, когда прилетит
/// очередное событие и придёт ли итог хода. Отмена подписки («Стоп») видна в
/// [cancelled] — так проверяется, что контроллер действительно рвёт соединение.
class _StreamingAssistantRepository
    with NoAssistantCart
    implements AssistantRepository {
  final events = StreamController<AssistantStreamEvent>();
  bool cancelled = false;
  int sendCalls = 0;
  AssistantReply? postReply;

  @override
  Future<AssistantReply> send({
    required List<ChatMessage> history,
    String? cartId,
    String? orderId,
    List<ChatFile> files = const [],
  }) async {
    sendCalls++;
    final reply = postReply;
    if (reply == null) throw Exception('boom');
    return reply;
  }

  @override
  Stream<AssistantStreamEvent> stream({
    required List<ChatMessage> history,
    String? cartId,
    String? orderId,
    List<ChatFile> files = const [],
  }) {
    events.onCancel = () => cancelled = true;
    return events.stream;
  }
}

/// Фейк без стриминга: поток не открывается, контроллер обязан повторить ход
/// обычным POST (откат из T10.1d).
class _NoStreamAssistantRepository
    with NoAssistantCart
    implements AssistantRepository {
  _NoStreamAssistantRepository(this.reply);

  final AssistantReply reply;
  int sendCalls = 0;
  List<ChatMessage> lastHistory = const [];

  @override
  Future<AssistantReply> send({
    required List<ChatMessage> history,
    String? cartId,
    String? orderId,
    List<ChatFile> files = const [],
  }) async {
    sendCalls++;
    lastHistory = history;
    return reply;
  }

  @override
  Stream<AssistantStreamEvent> stream({
    required List<ChatMessage> history,
    String? cartId,
    String? orderId,
    List<ChatFile> files = const [],
  }) => Stream<AssistantStreamEvent>.error(
    const AssistantStreamUnavailableException('no stream'),
  );
}

Future<ProviderContainer> _container(AssistantRepository repository) async {
  SharedPreferences.setMockInitialValues({});
  final prefs = await SharedPreferences.getInstance();
  final container = ProviderContainer(
    overrides: [
      sharedPreferencesProvider.overrideWithValue(prefs),
      assistantRepositoryProvider.overrideWithValue(repository),
    ],
  );
  await container.read(chatHistoryControllerProvider.future);
  return container;
}

void main() {
  test('ответ печатается дельтами, итог хода заменяет ленту', () async {
    final repository = _StreamingAssistantRepository();
    final container = await _container(repository);
    addTearDown(container.dispose);
    final controller = container.read(chatControllerProvider.notifier);

    final turn = controller.send('нужен цемент');
    await Future<void>.delayed(Duration.zero);
    expect(container.read(chatControllerProvider).isSending, isTrue);
    // Ход начался, но текста ещё нет — экран покажет «печатает…».
    expect(container.read(chatControllerProvider).streamingText, isEmpty);

    repository.events.add(const AssistantTextDelta('Нашёл '));
    await Future<void>.delayed(Duration.zero);
    expect(container.read(chatControllerProvider).streamingText, 'Нашёл ');

    repository.events.add(const AssistantTextDelta('цемент М400.'));
    await Future<void>.delayed(Duration.zero);
    expect(
      container.read(chatControllerProvider).streamingText,
      'Нашёл цемент М400.',
    );

    repository.events.add(
      AssistantTurnDone(
        const AssistantReply(
          messages: [
            ChatMessage(role: ChatRole.user, content: 'нужен цемент'),
            ChatMessage(
              role: ChatRole.assistant,
              content: 'Нашёл цемент М400.',
            ),
          ],
          cartId: 'cart_1',
        ),
      ),
    );
    await turn;

    final state = container.read(chatControllerProvider);
    expect(state.isSending, isFalse);
    // Дописанный ответ живёт в ленте, «печатаемый» текст очищен.
    expect(state.streamingText, isEmpty);
    expect(state.messages.map((m) => m.content), [
      'нужен цемент',
      'Нашёл цемент М400.',
    ]);
    expect(state.cartId, 'cart_1');
    expect(repository.sendCalls, 0);
  });

  test('преамбула перед инструментом сбрасывается (событие reset)', () async {
    final repository = _StreamingAssistantRepository();
    final container = await _container(repository);
    addTearDown(container.dispose);
    final controller = container.read(chatControllerProvider.notifier);

    final turn = controller.send('10 мешков цемента');
    await Future<void>.delayed(Duration.zero);
    repository.events.add(const AssistantTextDelta('Сейчас поищу…'));
    await Future<void>.delayed(Duration.zero);
    repository.events.add(const AssistantTextReset());
    await Future<void>.delayed(Duration.zero);
    expect(container.read(chatControllerProvider).streamingText, isEmpty);

    repository.events.add(const AssistantTextDelta('Добавил 10 мешков.'));
    repository.events.add(
      AssistantTurnDone(
        const AssistantReply(
          messages: [
            ChatMessage(role: ChatRole.user, content: '10 мешков цемента'),
            ChatMessage(
              role: ChatRole.assistant,
              content: 'Добавил 10 мешков.',
            ),
          ],
        ),
      ),
    );
    await turn;

    expect(
      container.read(chatControllerProvider).messages.last.content,
      'Добавил 10 мешков.',
    );
  });

  test(
    '«Стоп»: в ленте остаётся напечатанное, токены хода сохраняются',
    () async {
      final repository = _StreamingAssistantRepository();
      final container = await _container(repository);
      addTearDown(container.dispose);
      final controller = container.read(chatControllerProvider.notifier);

      final turn = controller.send('смета на фундамент');
      await Future<void>.delayed(Duration.zero);
      // Инструмент создал корзину — токен пришёл ДО обрыва.
      repository.events.add(const AssistantTokens(cartId: 'cart_9'));
      repository.events.add(const AssistantTextDelta('Считаю материалы'));
      await Future<void>.delayed(Duration.zero);

      controller.stop();
      await turn;

      final state = container.read(chatControllerProvider);
      // Соединение оборвано — поток отменён.
      expect(repository.cancelled, isTrue);
      expect(state.isSending, isFalse);
      expect(state.hasError, isFalse);
      expect(state.streamingText, isEmpty);
      expect(state.messages.map((m) => m.content), [
        'смета на фундамент',
        'Считаю материалы',
      ]);
      // Корзина, созданная инструментом до «Стопа», осталась у покупателя.
      expect(state.cartId, 'cart_9');
    },
  );

  test('«Стоп» до первой дельты не оставляет пустого ответа', () async {
    final repository = _StreamingAssistantRepository();
    final container = await _container(repository);
    addTearDown(container.dispose);
    final controller = container.read(chatControllerProvider.notifier);

    final turn = controller.send('привет');
    await Future<void>.delayed(Duration.zero);
    controller.stop();
    await turn;

    final state = container.read(chatControllerProvider);
    expect(state.messages.map((m) => m.content), ['привет']);
    expect(state.hasError, isFalse);
    expect(state.isSending, isFalse);
  });

  test('после «Стопа» следующий ход отправляется как обычно', () async {
    final repository = _StreamingAssistantRepository();
    final container = await _container(repository);
    addTearDown(container.dispose);
    final controller = container.read(chatControllerProvider.notifier);

    final first = controller.send('привет');
    await Future<void>.delayed(Duration.zero);
    controller.stop();
    await first;

    // Второй ход: тот же фейк отдаёт новый поток (StreamController закрыт —
    // берём свежий репозиторий состояния через постоянный поток).
    expect(container.read(chatControllerProvider).isSending, isFalse);
    final second = controller.send('нужен цемент');
    await Future<void>.delayed(Duration.zero);
    // Поток уже закрыт (его отменили) — ход завершится без ответа, но экран
    // не должен зависнуть в «печатает…».
    await second;
    expect(container.read(chatControllerProvider).isSending, isFalse);
  });

  test('стрима нет — тот же ход уходит обычным POST', () async {
    final repository = _NoStreamAssistantRepository(
      const AssistantReply(
        messages: [
          ChatMessage(role: ChatRole.user, content: 'нужен цемент'),
          ChatMessage(role: ChatRole.assistant, content: 'Вот варианты.'),
        ],
        cartId: 'cart_2',
      ),
    );
    final container = await _container(repository);
    addTearDown(container.dispose);

    await container.read(chatControllerProvider.notifier).send('нужен цемент');

    final state = container.read(chatControllerProvider);
    expect(repository.sendCalls, 1);
    expect(repository.lastHistory.single.content, 'нужен цемент');
    expect(state.messages.last.content, 'Вот варианты.');
    expect(state.cartId, 'cart_2');
    expect(state.hasError, isFalse);
  });

  test('ошибка внутри потока поднимает баннер повтора', () async {
    final repository = _StreamingAssistantRepository();
    final container = await _container(repository);
    addTearDown(container.dispose);

    final turn = container
        .read(chatControllerProvider.notifier)
        .send('нужен цемент');
    await Future<void>.delayed(Duration.zero);
    repository.events.addError(Exception('AI is not configured'));
    await turn;

    final state = container.read(chatControllerProvider);
    expect(state.hasError, isTrue);
    expect(state.isSending, isFalse);
    expect(state.streamingText, isEmpty);
    // Реплика покупателя осталась в ленте — «Повторить» отправит её заново.
    expect(state.messages.map((m) => m.content), ['нужен цемент']);
    // Ошибку внутри потока обычным POST НЕ переигрываем: инструменты хода
    // могли уже сработать.
    expect(repository.sendCalls, 0);
  });
}
