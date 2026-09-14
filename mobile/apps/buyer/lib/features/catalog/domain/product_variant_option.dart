/// Вариант товара — тонкая презентационная модель для экрана деталей. Цена
/// приходит из бэкенда рассчитанной для выбранного варианта (клиент не считает).
class ProductVariantOption {
  const ProductVariantOption({
    required this.id,
    required this.title,
    this.priceAmount,
    this.currencyCode,
  });

  /// Идентификатор варианта.
  final String id;

  /// Название варианта (например, «Мешок 50 кг»).
  final String title;

  /// Рассчитанная бэкендом цена варианта; null — если цены нет.
  final num? priceAmount;

  /// Код валюты цены (например, `kzt`); null — если цены нет.
  final String? currencyCode;
}
