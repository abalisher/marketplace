/// Формирует подпись цены из суммы и валюты. При отсутствии цены возвращает
/// переданную (локализованную) подпись «цена по запросу». Дробные нули
/// отбрасываются (1990.0 → «1990»). Клиент только отображает — сумму считает
/// бэкенд. Общий помощник каталога и корзины.
String formatPriceLabel({
  required num? amount,
  required String? currencyCode,
  required String unavailableLabel,
}) {
  if (amount == null || currencyCode == null) return unavailableLabel;
  final formatted = amount == amount.roundToDouble()
      ? amount.toInt().toString()
      : amount.toString();
  return '$formatted ${currencyCode.toUpperCase()}';
}
