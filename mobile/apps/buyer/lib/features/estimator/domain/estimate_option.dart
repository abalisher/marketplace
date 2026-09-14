/// Вариант товара под позицию расчёта в конкретном сегменте. Цену/итог/наличие
/// считает бэкенд; экран только отображает. `segment` — сырой код
/// (economy|comfort|business), локализуется на экране.
class EstimateOption {
  const EstimateOption({
    required this.segment,
    required this.unitPrice,
    required this.total,
    required this.inStock,
    this.productTitle,
  });

  final String segment;
  final String? productTitle;
  final num unitPrice;
  final num total;
  final bool inStock;
}
