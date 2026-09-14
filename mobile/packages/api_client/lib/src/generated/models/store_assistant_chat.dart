// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_assistant_file.dart';
import 'store_assistant_message.dart';

part 'store_assistant_chat.g.dart';

@JsonSerializable()
class StoreAssistantChat {
  const StoreAssistantChat({
    required this.messages,
    this.cartId,
    this.orderId,
    this.files,
  });

  factory StoreAssistantChat.fromJson(Map<String, Object?> json) =>
      _$StoreAssistantChatFromJson(json);

  /// История диалога целиком; последнее сообщение — от покупателя (role=user).
  final List<StoreAssistantMessage> messages;

  /// Id корзины, которую клиент держит между ходами (получен из cart_id ответа). Необязателен: до первого добавления товара корзины ещё нет.
  @JsonKey(name: 'cart_id')
  final String? cartId;

  /// Id последнего оформленного заказа (получен из order_id ответа). Клиент держит его между ходами, чтобы ассистент мог отследить статус заказа. Необязателен: до оформления заказа его ещё нет.
  @JsonKey(name: 'order_id')
  final String? orderId;

  /// Вложения ЭТОГО хода (T10.4): фото списка от прораба, фото объекта, PDF. Относятся к последней реплике покупателя, между ходами не тянутся — в ответе их нет, обратно клиент их не шлёт. Принимаются image/jpeg, image/png, image/webp, image/heic, image/heif и application/pdf; таблицы (XLSX/CSV/DOCX) отклоняются отдельной ошибкой — их разбирает детерминированный парсер, а не зрительная модель. Пределы: 8 МБ на файл, 12 МБ суммарно, 3 файла за ход. Файл нигде не сохраняется: тело запроса → модель → конец запроса.
  final List<StoreAssistantFile>? files;

  Map<String, Object?> toJson() => _$StoreAssistantChatToJson(this);
}
