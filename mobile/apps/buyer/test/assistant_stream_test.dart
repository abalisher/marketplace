import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:marketplace_buyer/features/assistant/data/assistant_stream_exception.dart';
import 'package:marketplace_buyer/features/assistant/data/medusa_assistant_repository.dart';
import 'package:marketplace_buyer/features/assistant/domain/assistant_stream_event.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_attachment.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_message.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_role.dart';

/// Фейковый адаптер: отдаёт заготовленный SSE-поток вместо сети. Куски
/// намеренно режутся не по границам событий — так проверяется буферизация.
class _SseAdapter implements HttpClientAdapter {
  _SseAdapter(this.chunks, {this.status = 200});

  final List<String> chunks;
  final int status;
  RequestOptions? lastOptions;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<List<int>>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    lastOptions = options;
    if (status != 200) {
      return ResponseBody.fromString('nope', status);
    }
    return ResponseBody(
      Stream<Uint8List>.fromIterable(
        chunks.map((c) => Uint8List.fromList(utf8.encode(c))),
      ),
      200,
      headers: {
        Headers.contentTypeHeader: ['text/event-stream'],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

String _event(String name, Object? data) =>
    'event: $name\ndata: ${jsonEncode(data ?? const <String, dynamic>{})}\n\n';

MedusaAssistantRepository _repository(_SseAdapter adapter) {
  final dio = Dio(BaseOptions(baseUrl: 'http://localhost:9000'));
  dio.httpClientAdapter = adapter;
  return MedusaAssistantRepository(dio);
}

void main() {
  test(
    'поток разбирается в события: дельты, сброс, токены и итог хода',
    () async {
      final done = _event('done', {
        'reply': 'Добавил 10 мешков.',
        'messages': [
          {'role': 'user', 'content': '10 мешков цемента'},
          {'role': 'assistant', 'content': 'Добавил 10 мешков.'},
        ],
        'cart_id': 'cart_1',
        'attachments': [
          {
            'type': 'product_card',
            'variant_id': 'variant_1',
            'title': 'Цемент М400 — Мешок 50 кг',
            'price': 3200,
            'currency': 'kzt',
            'unit': 'мешок',
            'in_stock': true,
            'image_url': null,
          },
        ],
        'aborted': false,
      });
      final adapter = _SseAdapter([
        ': keep-alive\n\n',
        _event('open', null),
        // Преамбула модели, затем вызов инструмента → сброс напечатанного.
        _event('delta', {'text': 'Сейчас поищу…'}),
        _event('reset', null),
        _event('state', {'cart_id': 'cart_1'}),
        // Событие разрезано между кусками потока.
        _event('delta', {'text': 'Добавил '}).substring(0, 18),
        _event('delta', {'text': 'Добавил '}).substring(18),
        _event('delta', {'text': '10 мешков.'}),
        done.substring(0, 40),
        done.substring(40),
      ]);

      final events = await _repository(adapter)
          .stream(
            history: [
              const ChatMessage(
                role: ChatRole.user,
                content: '10 мешков цемента',
              ),
            ],
            cartId: 'cart_0',
          )
          .toList();

      expect(
        events.whereType<AssistantTextDelta>().map((e) => e.text).toList(),
        ['Сейчас поищу…', 'Добавил ', '10 мешков.'],
      );
      expect(events.whereType<AssistantTextReset>(), hasLength(1));
      expect(events.whereType<AssistantTokens>().single.cartId, 'cart_1');

      final result = events.whereType<AssistantTurnDone>().single.reply;
      expect(result.cartId, 'cart_1');
      expect(result.messages.last.content, 'Добавил 10 мешков.');
      // Вставки хода привязаны к последнему ответу и разобраны контрактом.
      final card = result.messages.last.attachments.single;
      expect(card, isA<ProductCardAttachment>());
      expect((card as ProductCardAttachment).unit, 'мешок');

      // Ход ушёл на потоковый роут и унёс удерживаемый токен корзины.
      expect(adapter.lastOptions?.path, '/store/assistant/chat/stream');
      final body = adapter.lastOptions?.data as Map<String, dynamic>;
      expect(body['cart_id'], 'cart_0');
      expect((body['messages'] as List).single, {
        'role': 'user',
        'content': '10 мешков цемента',
      });
    },
  );

  test(
    'роут потока недоступен (404) — ошибка отката на обычный POST',
    () async {
      final repository = _repository(_SseAdapter(const [], status: 404));

      await expectLater(
        repository.stream(
          history: [const ChatMessage(role: ChatRole.user, content: 'цемент')],
        ),
        emitsError(isA<AssistantStreamUnavailableException>()),
      );
    },
  );

  test('поток закрылся без событий — тоже откат на обычный POST', () async {
    final repository = _repository(_SseAdapter(const [': keep-alive\n\n']));

    await expectLater(
      repository.stream(
        history: [const ChatMessage(role: ChatRole.user, content: 'цемент')],
      ),
      emitsError(isA<AssistantStreamUnavailableException>()),
    );
  });

  test('ошибка внутри открытого потока откатом НЕ считается', () async {
    final repository = _repository(
      _SseAdapter([
        _event('open', null),
        _event('error', {'message': 'AI is not configured'}),
      ]),
    );

    await expectLater(
      repository.stream(
        history: [const ChatMessage(role: ChatRole.user, content: 'цемент')],
      ),
      emitsError(
        allOf(
          isA<Exception>(),
          isNot(isA<AssistantStreamUnavailableException>()),
          predicate<Object>(
            (e) => e.toString().contains('AI is not configured'),
          ),
        ),
      ),
    );
  });
}
