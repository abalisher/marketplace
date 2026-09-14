/// Строка корзины — тонкая презентационная модель. Собирается из ответа Store
/// API в репозитории; экран знает только о ней. Цену за единицу считает бэкенд.
class CartLine {
  const CartLine({
    required this.id,
    required this.title,
    required this.quantity,
    required this.unitPrice,
    required this.currencyCode,
    this.variantTitle,
    this.thumbnailUrl,
  });

  /// Идентификатор строки корзины (line item) — используется для мутаций.
  final String id;

  /// Название товара.
  final String title;

  /// Название варианта (например, «Мешок 50 кг»); null — если не задано.
  final String? variantTitle;

  /// URL миниатюры; null — если изображения нет.
  final String? thumbnailUrl;

  /// Количество единиц в строке.
  final int quantity;

  /// Цена за единицу (рассчитана бэкендом).
  final num unitPrice;

  /// Код валюты цены (например, `kzt`).
  final String currencyCode;
}
