import 'estimate_option.dart';

/// Позиция расчёта: вид материала, требуемое количество с единицей измерения и
/// подобранные бэкендом варианты товаров по сегментам (может быть пусто — если
/// у норматива нет привязки к каталогу или товары не найдены).
class EstimateItem {
  const EstimateItem({
    required this.materialKind,
    required this.quantity,
    required this.unit,
    this.options = const [],
  });

  /// Вид материала (человекочитаемая подпись из нормативной базы).
  final String materialKind;

  /// Требуемое количество (считает бэкенд).
  final num quantity;

  /// Единица измерения (из норматива).
  final String unit;

  /// Варианты товаров по сегментам (эконом/комфорт/бизнес).
  final List<EstimateOption> options;
}
