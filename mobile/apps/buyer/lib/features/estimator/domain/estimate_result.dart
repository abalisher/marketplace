import 'estimate_item.dart';

/// Результат расчёта материалов: id расчёта, валюта цен подборки и список
/// позиций с количествами и вариантами товаров.
class EstimateResult {
  const EstimateResult({
    required this.id,
    required this.currencyCode,
    required this.items,
  });

  final String id;
  final String currencyCode;
  final List<EstimateItem> items;

  bool get isEmpty => items.isEmpty;
}
