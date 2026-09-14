import 'dart:async';
import 'dart:convert';

import 'package:api_client/api_client.dart'
    show
        StoreAssistantAuthPrompt,
        StoreAssistantOrderDocuments,
        StoreAssistantOrderStatus,
        StoreAssistantPayment,
        StoreAssistantProductCard;
import 'package:dio/dio.dart';

import '../domain/assistant_reply.dart';
import '../domain/assistant_stream_event.dart';
import '../domain/cart_line.dart';
import '../domain/cart_summary.dart';
import '../domain/chat_attachment.dart';
import '../domain/chat_file.dart';
import '../domain/chat_message.dart';
import '../domain/chat_role.dart';
import 'assistant_repository.dart';
import 'assistant_stream_exception.dart';

/// Реализация [AssistantRepository] поверх Medusa Store API
/// (`POST /store/assistant/chat` и потоковый `.../chat/stream`). Идёт напрямую
/// через настроенный [Dio] (базовый URL + publishable-ключ + auth уже в нём), а
/// НЕ через сгенерированный rest-клиент: обёртку вложений (discriminated `oneOf`)
/// кодоген сворачивает в пустой класс, а SSE он не умеет вовсе. Сами вложения
/// при этом типизированы контрактом: по дискриминатору `type` каждый элемент
/// десериализуется генерированной моделью
/// (StoreAssistantProductCard/Payment/OrderStatus) и маппится в домен.
/// Бизнес-логики нет — только конвертация история↔JSON, разбор вставок и разбор
/// потока SSE.
class MedusaAssistantRepository implements AssistantRepository {
  MedusaAssistantRepository(this._dio);

  final Dio _dio;

  Map<String, dynamic> _requestBody({
    required List<ChatMessage> history,
    String? cartId,
    String? orderId,
    List<ChatFile> files = const [],
  }) {
    final body = <String, dynamic>{
      'messages': history
          .map(
            (m) => {
              'role': m.role == ChatRole.user ? 'user' : 'assistant',
              'content': m.content,
            },
          )
          .toList(),
    };
    // Токены сессии клиент держит между ходами и шлёт обратно, если они есть.
    if (cartId != null) body['cart_id'] = cartId;
    if (orderId != null) body['order_id'] = orderId;
    // Вложения — только текущего хода: в истории они не возвращаются и обратно
    // не уходят (T10.4). Имя файла нужно ленте, а не модели.
    if (files.isNotEmpty) {
      body['files'] = [
        for (final file in files)
          {
            'mime_type': file.mimeType,
            'data': base64Encode(file.bytes),
            'name': file.name,
          },
      ];
    }
    return body;
  }

  @override
  Future<AssistantReply> send({
    required List<ChatMessage> history,
    String? cartId,
    String? orderId,
    List<ChatFile> files = const [],
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/store/assistant/chat',
      data: _requestBody(
        history: history,
        cartId: cartId,
        orderId: orderId,
        files: files,
      ),
    );

    return _toReply(response.data ?? const {});
  }

  @override
  Stream<AssistantStreamEvent> stream({
    required List<ChatMessage> history,
    String? cartId,
    String? orderId,
    List<ChatFile> files = const [],
  }) {
    final cancel = CancelToken();
    final controller = StreamController<AssistantStreamEvent>(
      // Отмена подписки = «Стоп» покупателя: рвём соединение, бэкенд по обрыву
      // гасит ход у модели.
      onCancel: () {
        if (!cancel.isCancelled) cancel.cancel('stopped by buyer');
      },
    );
    controller.onListen = () {
      _pump(
        controller,
        cancel,
        _requestBody(
          history: history,
          cartId: cartId,
          orderId: orderId,
          files: files,
        ),
      );
    };
    return controller.stream;
  }

  /// Читает SSE-поток хода и раскладывает его в события домена. Ошибки до
  /// первого события — [AssistantStreamUnavailableException] (контроллер
  /// откатится на обычный POST); после — обычная ошибка хода.
  Future<void> _pump(
    StreamController<AssistantStreamEvent> controller,
    CancelToken cancel,
    Map<String, dynamic> body,
  ) async {
    var opened = false;
    try {
      final response = await _dio.post<ResponseBody>(
        '/store/assistant/chat/stream',
        data: body,
        cancelToken: cancel,
        options: Options(
          responseType: ResponseType.stream,
          headers: {'accept': 'text/event-stream'},
        ),
      );
      final payload = response.data;
      if (payload == null) {
        throw const AssistantStreamUnavailableException('empty stream body');
      }

      var buffer = '';
      await for (final chunk in utf8.decoder.bind(payload.stream)) {
        // Возврат каретки убираем целиком: разделитель событий может быть как
        // `\n\n`, так и `\r\n\r\n`, а внутри JSON сырого CR не бывает.
        buffer += chunk.replaceAll('\r', '');
        final events = buffer.split('\n\n');
        buffer = events.removeLast();
        for (final raw in events) {
          if (_emit(controller, raw)) opened = true;
        }
      }
      if (buffer.trim().isNotEmpty) {
        if (_emit(controller, buffer)) opened = true;
      }
      if (!opened) {
        throw const AssistantStreamUnavailableException(
          'stream closed without events',
        );
      }
    } catch (error) {
      // «Стоп» — штатный конец потока, а не сбой: слушателя уже нет.
      if (!cancel.isCancelled && !controller.isClosed) {
        controller.addError(
          opened || error is AssistantStreamUnavailableException
              ? error
              : AssistantStreamUnavailableException(error.toString()),
        );
      }
    } finally {
      if (!controller.isClosed) await controller.close();
    }
  }

  /// Разбирает одно событие SSE и кладёт его в поток. Возвращает `true`, если
  /// событие подтверждает, что поток живой (по нему решается, можно ли ещё
  /// откатываться на обычный POST).
  bool _emit(StreamController<AssistantStreamEvent> controller, String raw) {
    var event = 'message';
    final data = StringBuffer();
    for (final line in raw.split('\n')) {
      if (line.startsWith('event:')) {
        event = line.substring(6).trim();
      } else if (line.startsWith('data:')) {
        data.write(line.substring(5).trim());
      }
    }
    final payload = data.toString();
    switch (event) {
      case 'open':
        return true;
      case 'delta':
        final json = jsonDecode(payload) as Map<String, dynamic>;
        controller.add(AssistantTextDelta((json['text'] as String?) ?? ''));
        return true;
      case 'reset':
        controller.add(const AssistantTextReset());
        return true;
      case 'state':
        final json = jsonDecode(payload) as Map<String, dynamic>;
        controller.add(
          AssistantTokens(
            cartId: json['cart_id'] as String?,
            orderId: json['order_id'] as String?,
          ),
        );
        return true;
      case 'done':
        final json = jsonDecode(payload) as Map<String, dynamic>;
        controller.add(AssistantTurnDone(_toReply(json)));
        return true;
      case 'error':
        final json = jsonDecode(payload) as Map<String, dynamic>;
        controller.addError(
          Exception((json['message'] as String?) ?? 'assistant turn failed'),
        );
        return true;
      default:
        return false;
    }
  }

  @override
  Future<CartSummary> setCartQuantities({
    String? cartId,
    required Map<String, int> quantities,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/store/assistant/cart/items',
      data: {
        // Корзины может ещё не быть — первое положительное количество её
        // создаст (как add_to_cart), и её id придёт в ответе.
        'cart_id': ?cartId,
        'items': [
          for (final entry in quantities.entries)
            {'variant_id': entry.key, 'quantity': entry.value},
        ],
      },
    );
    return _toCart(response.data ?? const {});
  }

  @override
  Future<CartSummary> readCart(String cartId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/store/assistant/cart',
      queryParameters: {'cart_id': cartId},
    );
    return _toCart(response.data ?? const {});
  }

  /// Ответ роутов корзины чата → домен. `cart_id` берём из корня ответа: у
  /// пустой корзины в сводке он пустой строкой, а знать надо именно «есть ли
  /// корзина» (её мог создать первый «+»).
  CartSummary _toCart(Map<String, dynamic> data) {
    final cart = (data['cart'] as Map<String, dynamic>?) ?? const {};
    final rawItems = (cart['items'] as List? ?? const [])
        .whereType<Map<String, dynamic>>();
    return CartSummary(
      cartId: data['cart_id'] as String?,
      currency: (cart['currency'] as String?) ?? 'kzt',
      items: [
        for (final item in rawItems)
          CartLine(
            variantId: (item['variant_id'] as String?) ?? '',
            title: (item['title'] as String?) ?? '',
            quantity: (item['quantity'] as num?)?.round() ?? 0,
            unitPrice: (item['unit_price'] as num?)?.round() ?? 0,
            total: (item['total'] as num?)?.round() ?? 0,
          ),
      ],
      total: (cart['total'] as num?)?.round() ?? 0,
    );
  }

  /// Итог хода (тело обычного POST либо событие `done` потока) → домен.
  AssistantReply _toReply(Map<String, dynamic> data) {
    final rawMessages = (data['messages'] as List? ?? const [])
        .cast<Map<String, dynamic>>();
    final attachments = _parseAttachments(data['attachments']);

    final messages = <ChatMessage>[];
    for (var i = 0; i < rawMessages.length; i++) {
      final m = rawMessages[i];
      final role = m['role'] == 'user' ? ChatRole.user : ChatRole.assistant;
      final isLast = i == rawMessages.length - 1;
      messages.add(
        ChatMessage(
          role: role,
          content: (m['content'] as String?) ?? '',
          // Вставки хода привязываем к последнему ответу ассистента.
          attachments: isLast && role == ChatRole.assistant
              ? attachments
              : const [],
        ),
      );
    }

    return AssistantReply(
      messages: messages,
      cartId: data['cart_id'] as String?,
      orderId: data['order_id'] as String?,
    );
  }

  List<ChatAttachment> _parseAttachments(Object? raw) {
    if (raw is! List) return const [];
    return raw.whereType<Map<String, dynamic>>().map(_toAttachment).toList();
  }

  ChatAttachment _toAttachment(Map<String, dynamic> j) {
    // Неизвестный тип или расхождение с контрактом не роняют чат —
    // такая вставка просто не отрисовывается (UnknownAttachment).
    try {
      switch (j['type']) {
        case 'product_card':
          final card = StoreAssistantProductCard.fromJson(j);
          return ProductCardAttachment(
            variantId: card.variantId,
            title: card.title,
            price: card.price.round(),
            currency: card.currency,
            unit: card.unit,
            inStock: card.inStock,
            imageUrl: card.imageUrl,
          );
        case 'payment':
          final payment = StoreAssistantPayment.fromJson(j);
          return PaymentAttachment(
            provider: payment.provider.json ?? 'kaspi',
            status: payment.status,
            paid: payment.paid,
            amount: payment.amount?.round(),
            currency: payment.currency,
            qrPayload: payment.qrPayload,
            paymentUrl: payment.paymentUrl,
          );
        case 'order_status':
          final status = StoreAssistantOrderStatus.fromJson(j);
          return OrderStatusAttachment(
            displayId: status.displayId?.round(),
            statusText: status.statusText,
            deliveryStage: status.deliveryStage,
            courierNote: status.courierNote,
            deliveryCode: status.deliveryCode,
            deliveryDate: status.deliveryDate,
            deliveryWindow: status.deliveryWindow?.json,
          );
        case 'documents':
          final docs = StoreAssistantOrderDocuments.fromJson(j);
          return OrderDocumentsAttachment(
            displayId: docs.displayId?.round(),
            documents: docs.documents
                .map(
                  (d) => OrderDocumentItem(
                    docType: d.docType.json ?? '',
                    title: d.title,
                    number: d.number,
                    url: d.url,
                  ),
                )
                .toList(),
          );
        case 'auth_prompt':
          final prompt = StoreAssistantAuthPrompt.fromJson(j);
          return AuthPromptAttachment(reason: prompt.reason.json ?? 'checkout');
        default:
          return const UnknownAttachment();
      }
    } catch (_) {
      return const UnknownAttachment();
    }
  }
}
