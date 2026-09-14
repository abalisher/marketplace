/// Способ получения заказа (доставка/самовывоз) — презентационная проекция
/// shipping-option Medusa. Цену считает бэкенд (`calculatedPrice`); экран
/// только отображает.
class ShippingOption {
  const ShippingOption({
    required this.id,
    required this.name,
    required this.amount,
    required this.currencyCode,
  });

  final String id;
  final String name;

  /// Стоимость способа получения (0 — бесплатно, напр. самовывоз).
  final num amount;
  final String currencyCode;
}
