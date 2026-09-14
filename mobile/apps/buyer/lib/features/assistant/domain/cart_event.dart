/// Отметка в ленте о том, что покупатель сам изменил корзину счётчиком
/// (T10.15). Это ИМЕННО отметка события, а не реплика: она не уходит модели и
/// не хранится в истории диалога — иначе получилась бы «фраза, которую я не
/// писал» (замечание владельца 2026-08-31 к прежнему тапу по карточке).
class CartEvent {
  const CartEvent({
    required this.variantId,
    required this.title,
    required this.quantity,
  });

  final String variantId;
  final String title;

  /// Сколько стало; 0 — позицию убрали.
  final int quantity;
}
