import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/assistant_stream_exception.dart';
import '../domain/assistant_reply.dart';
import '../domain/assistant_stream_event.dart';
import '../domain/chat_conversation.dart';
import '../domain/chat_file.dart';
import '../domain/chat_message.dart';
import '../domain/chat_role.dart';
import '../domain/chat_state.dart';
import 'assistant_cart_controller.dart';
import 'assistant_repository_provider.dart';
import 'chat_files_controller.dart';
import 'chat_history_controller.dart';

/// Максимальная длина заголовка диалога в истории (первая реплика покупателя).
const _titleMaxLength = 48;

/// Контроллер диалога с ассистентом. Держит историю и токены сессии, ведёт
/// статус хода. Логика подбора/корзины/оплаты — на бэкенде; контроллер лишь
/// шлёт историю и применяет ответ. Каждый успешный ход сохраняется в локальную
/// историю на устройстве (T2.5) — бэкенд остаётся stateless.
class ChatController extends Notifier<ChatState> {
  /// Подписка на идущий потоковый ход — её отмена и есть «Стоп» (T10.1d).
  StreamSubscription<AssistantStreamEvent>? _turn;

  /// Итог идущего хода: завершается событием `done`, ошибкой потока или
  /// «Стопом» (тогда — значением `null`, ответ склеим из напечатанного).
  Completer<AssistantReply?>? _turnResult;

  @override
  ChatState build() {
    ref.onDispose(() {
      _turn?.cancel();
      _turn = null;
    });
    return const ChatState();
  }

  /// Отправляет реплику покупателя. Оптимистично добавляет её в ленту, печатает
  /// ответ стримингом, затем заменяет историю тем, что вернул бэкенд (он —
  /// источник истины по диалогу и токенам корзины/заказа: `null` в ответе
  /// означает, что корзина потрачена оформлением, — тогда токен и не
  /// удерживаем). При ошибке оставляет введённую реплику в ленте и поднимает
  /// флаг — экран показывает повтор.
  Future<void> send(String text, {List<ChatFile> files = const []}) async {
    final trimmed = text.trim();
    // Отправка без текста допустима, если приложен файл: снимок листа без
    // подписи — нормальное сообщение, и придумывать подпись за покупателя
    // нечестно (T10.4).
    if ((trimmed.isEmpty && files.isEmpty) || state.isSending) return;

    final outgoing = [
      ...state.messages,
      ChatMessage(role: ChatRole.user, content: trimmed),
    ];
    // Превью вложения остаётся в пузыре реплики — привязываем его к индексу
    // этой реплики: сама история придёт с бэкенда, и файлов в ней уже не будет.
    final sentFiles = files.isEmpty
        ? state.sentFiles
        : {...state.sentFiles, outgoing.length - 1: files};
    // Подсказки прошлого хода снимаем сразу: они относились к прежнему
    // состоянию и на новом ходе заменятся тем, что посчитал бэкенд.
    state = state.copyWith(
      messages: outgoing,
      isSending: true,
      hasError: false,
      streamingText: '',
      sentFiles: sentFiles,
    );
    // Отметки о нажатиях счётчиков гаснут: дальше о корзине говорит ассистент —
    // он видит её состав снимком на начало хода (T10.15).
    ref.read(assistantCartControllerProvider.notifier).clearEvents();

    try {
      final reply = await _runTurn(outgoing, files);
      // Ход оборван «Стопом»: итога от бэкенда нет (соединение разорвано) —
      // ответом становится ровно то, что покупатель успел прочитать. Токены при
      // этом уже пришли отдельным событием, поэтому держим текущие.
      final printed = state.streamingText.trim();
      final messages =
          reply?.messages ??
          (printed.isEmpty
              ? outgoing
              : [
                  ...outgoing,
                  ChatMessage(role: ChatRole.assistant, content: printed),
                ]);
      // id диалога: сохраняем существующий (возобновлённый) или заводим новый.
      final conversationId =
          state.conversationId ??
          DateTime.now().microsecondsSinceEpoch.toString();
      state = ChatState(
        messages: messages,
        cartId: reply != null ? reply.cartId : state.cartId,
        orderId: reply != null ? reply.orderId : state.orderId,
        conversationId: conversationId,
        sentFiles: sentFiles,
      );
      // Корзину на этом ходе мог поменять и сам ассистент — перечитываем
      // состав, иначе счётчики и полоса корзины покажут вчерашние цифры.
      unawaited(
        ref
            .read(assistantCartControllerProvider.notifier)
            .refresh(state.cartId),
      );
      _persist();
    } catch (_) {
      state = state.copyWith(
        isSending: false,
        hasError: true,
        streamingText: '',
      );
    }
  }

  /// Прерывает идущий ход («Стоп», T10.1d): отменяем подписку — соединение
  /// рвётся, бэкенд гасит ход у модели. Уже исполненные инструменты НЕ
  /// откатываются: корзина и заказ живут на бэкенде, а не в черновике ответа.
  void stop() {
    final turn = _turn;
    if (turn == null) return;
    _turn = null;
    turn.cancel();
    final result = _turnResult;
    _turnResult = null;
    if (result != null && !result.isCompleted) result.complete(null);
  }

  /// Один ход: сначала потоком (ответ печатается), а если поток не открылся —
  /// тем же запросом обычным POST (ответ придёт целиком). Возвращает итог хода
  /// либо `null`, если ход прервали «Стопом».
  Future<AssistantReply?> _runTurn(
    List<ChatMessage> outgoing,
    List<ChatFile> files,
  ) async {
    try {
      return await _streamTurn(outgoing, files);
    } on AssistantStreamUnavailableException {
      return ref
          .read(assistantRepositoryProvider)
          .send(
            history: outgoing,
            cartId: state.cartId,
            orderId: state.orderId,
            files: files,
          );
    }
  }

  /// Потоковый ход: печатает ответ по дельтам и запоминает токены сразу, как
  /// только их пришлёт бэкенд.
  Future<AssistantReply?> _streamTurn(
    List<ChatMessage> outgoing,
    List<ChatFile> files,
  ) {
    final result = Completer<AssistantReply?>();
    _turnResult = result;
    _turn = ref
        .read(assistantRepositoryProvider)
        .stream(
          history: outgoing,
          cartId: state.cartId,
          orderId: state.orderId,
          files: files,
        )
        .listen(
          (event) {
            switch (event) {
              case AssistantTextDelta(:final text):
                state = state.copyWith(
                  streamingText: state.streamingText + text,
                );
              case AssistantTextReset():
                state = state.copyWith(streamingText: '');
              case AssistantTokens(:final cartId, :final orderId):
                // Токены хода запоминаем немедленно: «Стоп» посреди хода иначе
                // потерял бы созданную корзину.
                state = ChatState(
                  messages: state.messages,
                  cartId: cartId,
                  orderId: orderId,
                  conversationId: state.conversationId,
                  isSending: true,
                  streamingText: state.streamingText,
                  sentFiles: state.sentFiles,
                );
              case AssistantTurnDone(:final reply):
                if (!result.isCompleted) result.complete(reply);
            }
          },
          onError: (Object error) {
            if (!result.isCompleted) result.completeError(error);
          },
          onDone: () {
            // Поток закончился без итога хода — считаем ход прерванным.
            if (!result.isCompleted) result.complete(null);
          },
          cancelOnError: true,
        );
    return result.future.whenComplete(() {
      _turn?.cancel();
      _turn = null;
      _turnResult = null;
    });
  }

  /// Повторяет последний ход: снимает всё, что было после последней реплики
  /// покупателя (её ответ, если он пришёл), и отправляет реплику заново. Одна
  /// механика на два случая — повтор после ошибки (плашка в ленте) и «повторить
  /// ответ» под ответом ассистента (T10.1c).
  Future<void> regenerate() async {
    if (state.isSending) return;
    final messages = state.messages;
    final lastUser = messages.lastIndexWhere((m) => m.role == ChatRole.user);
    if (lastUser < 0) return;
    final text = messages[lastUser].content;
    // Вложения того же хода уходят снова: они живут ровно один ход, и без них
    // повтор спросил бы модель о снимке, которого она не видит.
    final files = state.sentFiles[lastUser] ?? const <ChatFile>[];
    state = state.copyWith(
      messages: messages.sublist(0, lastUser),
      hasError: false,
    );
    await send(text, files: files);
  }

  /// Повтор после ошибки хода — тот же [regenerate] (плашка ошибки оставляет
  /// реплику покупателя последней в ленте).
  Future<void> retry() => regenerate();

  /// Начинает новый диалог с чистого листа (новый id заведётся на первом ходе).
  void reset() {
    state = const ChatState();
    ref.read(assistantCartControllerProvider.notifier).reset();
    // Недоотправленное вложение к новому диалогу не относится (T10.4c).
    ref.read(chatFilesControllerProvider.notifier).clear();
  }

  /// Возобновляет сохранённый диалог из истории: подставляет его сообщения и
  /// токены сессии, чтобы продолжить корзину/трекинг с того же места.
  void loadConversation(ChatConversation conversation) {
    state = ChatState(
      messages: conversation.messages,
      cartId: conversation.cartId,
      orderId: conversation.orderId,
      conversationId: conversation.id,
    );
    // Недоотправленное вложение осталось от прежнего диалога — снимаем.
    ref.read(chatFilesControllerProvider.notifier).clear();
    // Корзина того же диалога: перечитываем состав, чтобы полоса корзины
    // поднялась вместе с лентой (T10.15).
    unawaited(
      ref
          .read(assistantCartControllerProvider.notifier)
          .refresh(conversation.cartId),
    );
  }

  /// Корзину создал счётчик «−/+» на карточке (T10.15): токен держим так же,
  /// как токен, пришедший ходом модели, — следующим ходом он уйдёт ассистенту.
  void attachCart(String cartId) {
    if (state.cartId == cartId) return;
    state = ChatState(
      messages: state.messages,
      cartId: cartId,
      orderId: state.orderId,
      conversationId: state.conversationId,
      isSending: state.isSending,
      hasError: state.hasError,
      streamingText: state.streamingText,
      sentFiles: state.sentFiles,
    );
    _persist();
  }

  /// Сохраняет текущий диалог в локальную историю (заголовок — первая реплика
  /// покупателя). Пустой диалог или диалог без id не сохраняем.
  ///
  /// Диалог может НАЧАТЬСЯ со снимка без подписи (T10.4c) — тогда первая
  /// реплика пуста, и заголовком становится первый непустой текст, то есть
  /// ответ ассистента: он выписывает разобранное словами. Безымянная строка в
  /// рельсе истории хуже любого заголовка — узнать по ней диалог нельзя.
  void _persist() {
    final id = state.conversationId;
    if (id == null || state.messages.isEmpty) return;
    final texts = state.messages.map((m) => m.content.trim());
    final first =
        state.messages
            .where(
              (m) => m.role == ChatRole.user && m.content.trim().isNotEmpty,
            )
            .map((m) => m.content.trim())
            .firstOrNull ??
        texts.where((text) => text.isNotEmpty).firstOrNull;
    if (first == null) return;
    final title = first.length > _titleMaxLength
        ? '${first.substring(0, _titleMaxLength).trimRight()}…'
        : first;
    ref
        .read(chatHistoryControllerProvider.notifier)
        .upsert(
          ChatConversation(
            id: id,
            title: title,
            updatedAt: DateTime.now(),
            messages: state.messages,
            cartId: state.cartId,
            orderId: state.orderId,
          ),
        );
  }
}

/// Провайдер контроллера диалога с ассистентом.
final chatControllerProvider = NotifierProvider<ChatController, ChatState>(
  ChatController.new,
);
