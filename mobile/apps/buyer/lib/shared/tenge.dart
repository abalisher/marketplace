/// Формат суммы в тенге по дизайн-системе: разряды разделены пробелом, символ
/// «₸» в конце («3200» → «3 200 ₸»). Магазин работает только в KZT (единый
/// регион), поэтому валюта не параметризуется. Общий помощник ленты ассистента
/// (карточка товара, платёж) и списка заказов — чтобы деньги везде выглядели
/// одинаково (tabular, с единицей).
String formatTenge(int amount) {
  final digits = amount.abs().toString();
  final buffer = StringBuffer();
  for (var i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 == 0) buffer.write(' ');
    buffer.write(digits[i]);
  }
  return '${amount < 0 ? '-' : ''}$buffer ₸';
}
