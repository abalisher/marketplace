// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_assistant_attachment.dart';
import 'store_assistant_message.dart';

part 'store_assistant_chat_stream_done.g.dart';

/// Итог потокового хода (событие `done` в SSE): то же, что у обычного POST, плюс признак обрыва по «Стоп».
@JsonSerializable()
class StoreAssistantChatStreamDone {
  const StoreAssistantChatStreamDone({
    required this.reply,
    required this.messages,
    required this.aborted,
    this.cartId,
    this.orderId,
    this.attachments,
  });

  factory StoreAssistantChatStreamDone.fromJson(Map<String, Object?> json) =>
      _$StoreAssistantChatStreamDoneFromJson(json);

  /// Текст ответа ассистента.
  final String reply;

  /// История, дополненная ответом ассистента (клиент хранит и шлёт обратно).
  final List<StoreAssistantMessage> messages;

  /// Актуальный id корзины (создаётся инструментом add_to_cart). Клиент хранит его и шлёт обратно следующим ходом. Отсутствует, пока корзина не создана.
  @JsonKey(name: 'cart_id')
  final String? cartId;

  /// Id последнего оформленного заказа (проставляется place_order). Клиент хранит его и шлёт обратно следующим ходом для отслеживания статуса через track_order. Отсутствует, пока заказ не оформлен.
  @JsonKey(name: 'order_id')
  final String? orderId;

  /// Read-only UI-вставки хода для отрисовки под ответом (карточки товара, оплата Kaspi, статус заказа, документы, просьба войти по номеру). Текстовый минимал + вставки. Пустой массив — вставок нет.
  final List<StoreAssistantAttachment>? attachments;

  /// Ход оборван покупателем («Стоп»): reply — то, что успело напечататься; пустая строка означает, что ответа в messages нет.
  final bool aborted;

  Map<String, Object?> toJson() => _$StoreAssistantChatStreamDoneToJson(this);
}
