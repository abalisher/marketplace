/// Read-only вставка в ленте чата (данные для карточки под ответом ассистента).
/// Бэкенд возвращает их в поле `attachments` ответа `/store/assistant/chat`.
/// Sealed-иерархия: неизвестный тип (расширение контракта) → [UnknownAttachment],
/// чтобы клиент не падал.
sealed class ChatAttachment {
  const ChatAttachment();
}

/// Карточка товара: фото, название, цена с единицей, наличие.
class ProductCardAttachment extends ChatAttachment {
  const ProductCardAttachment({
    required this.variantId,
    required this.title,
    required this.price,
    required this.currency,
    required this.inStock,
    this.unit,
    this.imageUrl,
  });

  final String variantId;
  final String title;

  /// Цена в тенге (целое, как отдаёт бэкенд).
  final int price;
  final String currency;
  final String? unit;
  final bool inStock;
  final String? imageUrl;
}

/// Оплата Kaspi: QR + сумма + ссылка + статус.
class PaymentAttachment extends ChatAttachment {
  const PaymentAttachment({
    required this.provider,
    required this.status,
    required this.paid,
    required this.currency,
    this.amount,
    this.qrPayload,
    this.paymentUrl,
  });

  final String provider;
  final String status;
  final bool paid;

  /// Сумма к оплате в тенге (итог корзины на момент счёта); null — неизвестна.
  final int? amount;
  final String currency;
  final String? qrPayload;
  final String? paymentUrl;
}

/// Статус оформленного заказа.
class OrderStatusAttachment extends ChatAttachment {
  const OrderStatusAttachment({
    this.displayId,
    this.statusText,
    this.deliveryStage,
    this.courierNote,
    this.deliveryCode,
    this.deliveryDate,
    this.deliveryWindow,
  });

  final int? displayId;
  final String? statusText;

  /// Стадия заказа КОДОМ жизненного цикла (`new` … `delivered`).
  final String? deliveryStage;

  /// Прогресс курьера текстом от бэкенда; null — курьер ещё не назначен.
  final String? courierNote;
  final String? deliveryCode;

  /// Слот доставки: календарные сутки Астаны и код окна приезда
  /// (`morning`|`day`|`evening`). Подпись собирает экран (T5.6a); null — заказ
  /// оформлен до появления слотов.
  final DateTime? deliveryDate;
  final String? deliveryWindow;
}

/// Документы заказа со ссылками на PDF (счёт, накладная, внутренний акт).
class OrderDocumentsAttachment extends ChatAttachment {
  const OrderDocumentsAttachment({required this.documents, this.displayId});

  final int? displayId;
  final List<OrderDocumentItem> documents;
}

/// Один документ заказа в карточке: тип, название, номер и ссылка на PDF.
class OrderDocumentItem {
  const OrderDocumentItem({
    required this.docType,
    required this.title,
    required this.number,
    this.url,
  });

  /// invoice | waybill | internal_avr.
  final String docType;
  final String title;
  final String number;

  /// null — файл ещё рендерится, открывать нечего.
  final String? url;
}

/// Просьба войти по номеру телефона (T10.8): покупатель дошёл до оформления
/// гостем. Единственная вставка с действием — вход живёт на отдельном экране,
/// репликой в чат его не сделать.
class AuthPromptAttachment extends ChatAttachment {
  const AuthPromptAttachment({required this.reason});

  /// Зачем нужен вход; сейчас единственная причина — `checkout` (оформление).
  final String reason;
}

/// Неизвестный тип вставки (форвард-совместимость с новыми типами контракта).
class UnknownAttachment extends ChatAttachment {
  const UnknownAttachment();
}
