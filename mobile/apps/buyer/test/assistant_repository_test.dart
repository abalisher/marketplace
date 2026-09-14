import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:marketplace_buyer/features/assistant/data/medusa_assistant_repository.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_attachment.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_message.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_role.dart';

/// Фейковый адаптер: отдаёт заготовленный JSON вместо сети.
class _FakeAdapter implements HttpClientAdapter {
  _FakeAdapter(this.payload);

  final Map<String, dynamic> payload;
  Map<String, dynamic>? lastRequestBody;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<List<int>>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    lastRequestBody = options.data as Map<String, dynamic>?;
    return ResponseBody.fromString(
      jsonEncode(payload),
      200,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

void main() {
  test('разбор attachments через контрактные модели: все известные типы + '
      'неизвестный', () async {
    final adapter = _FakeAdapter({
      'reply': 'Подобрал варианты',
      'messages': [
        {'role': 'user', 'content': 'Нужен цемент'},
        {'role': 'assistant', 'content': 'Подобрал варианты'},
      ],
      'cart_id': 'cart_1',
      'order_id': 'order_1',
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
        {
          'type': 'payment',
          'provider': 'kaspi',
          'status': 'pending',
          'paid': false,
          'amount': 92400,
          'currency': 'kzt',
          'qr_payload': 'kaspi://pay/demo',
          'payment_url': 'https://pay.kaspi.kz/demo',
        },
        {
          'type': 'order_status',
          'display_id': 4821,
          'status_text': 'В доставке',
          'delivery_stage': 'in_delivery',
          'courier_note': 'Курьер в пути',
          'delivery_code': '7419',
          'delivery_date': '2026-09-06',
          'delivery_window': 'day',
        },
        {
          'type': 'documents',
          'display_id': 4821,
          'documents': [
            {
              'doc_type': 'invoice',
              'title': 'Счёт на оплату',
              'number': 'INV-2026-000001',
              'url': 'http://test/static/invoice.pdf',
            },
            {
              'doc_type': 'waybill',
              'title': 'Накладная',
              'number': 'WB-2026-000004',
              'url': null,
            },
          ],
        },
        {'type': 'auth_prompt', 'reason': 'checkout'},
        {'type': 'future_widget', 'whatever': 1},
      ],
    });
    final dio = Dio(BaseOptions(baseUrl: 'http://test'))
      ..httpClientAdapter = adapter;
    final repo = MedusaAssistantRepository(dio);

    final reply = await repo.send(
      history: const [
        ChatMessage(role: ChatRole.user, content: 'Нужен цемент'),
      ],
      cartId: 'cart_1',
    );

    // Токены сессии ушли в запрос и вернулись из ответа.
    expect(adapter.lastRequestBody?['cart_id'], 'cart_1');
    expect(reply.cartId, 'cart_1');
    expect(reply.orderId, 'order_1');

    // Вставки привязаны к последнему ответу ассистента.
    final attachments = reply.messages.last.attachments;
    expect(attachments, hasLength(6));

    final card = attachments[0] as ProductCardAttachment;
    expect(card.variantId, 'variant_1');
    expect(card.title, 'Цемент М400 — Мешок 50 кг');
    expect(card.price, 3200);
    expect(card.unit, 'мешок');
    expect(card.inStock, isTrue);

    final payment = attachments[1] as PaymentAttachment;
    expect(payment.provider, 'kaspi');
    expect(payment.paid, isFalse);
    expect(payment.amount, 92400);
    expect(payment.currency, 'kzt');
    expect(payment.qrPayload, 'kaspi://pay/demo');

    final status = attachments[2] as OrderStatusAttachment;
    expect(status.displayId, 4821);
    expect(status.statusText, 'В доставке');
    // Стадия — код жизненного цикла, прогресс курьера — отдельным полем (T3.11).
    expect(status.deliveryStage, 'in_delivery');
    expect(status.courierNote, 'Курьер в пути');
    expect(status.deliveryCode, '7419');
    // Слот доставки: дата — календарные сутки, окно — код из контракта; подпись
    // собирает лента (T5.6a).
    // Дата слота приходит без времени и разбирается как местная полночь —
    // важны только сутки, поэтому подпись не зависит от таймзоны телефона.
    expect(status.deliveryDate, DateTime(2026, 9, 6));
    expect(status.deliveryWindow, 'day');

    // Документы заказа: ссылки на PDF приходят в ленту (T2.10 — «нажал „Нужны
    // документы“, но файлов не получил»).
    final documents = attachments[3] as OrderDocumentsAttachment;
    expect(documents.displayId, 4821);
    expect(documents.documents, hasLength(2));
    expect(documents.documents.first.docType, 'invoice');
    expect(documents.documents.first.number, 'INV-2026-000001');
    expect(documents.documents.first.url, 'http://test/static/invoice.pdf');
    // Документ без файла остаётся в списке — но открывать нечего.
    expect(documents.documents.last.url, isNull);

    // Просьба войти (T10.8): гость дошёл до оформления — в ленте карточка входа.
    final authPrompt = attachments[4] as AuthPromptAttachment;
    expect(authPrompt.reason, 'checkout');

    // Неизвестный тип не роняет разбор.
    expect(attachments[5], isA<UnknownAttachment>());
  });

  test(
    'битая вставка известного типа не роняет чат → UnknownAttachment',
    () async {
      final adapter = _FakeAdapter({
        'reply': 'ок',
        'messages': [
          {'role': 'assistant', 'content': 'ок'},
        ],
        'attachments': [
          // product_card без обязательных полей контракта.
          {'type': 'product_card'},
        ],
      });
      final dio = Dio(BaseOptions(baseUrl: 'http://test'))
        ..httpClientAdapter = adapter;
      final repo = MedusaAssistantRepository(dio);

      final reply = await repo.send(history: const []);

      expect(reply.messages.last.attachments.single, isA<UnknownAttachment>());
    },
  );
}
