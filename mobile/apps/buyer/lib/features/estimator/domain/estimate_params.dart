/// Параметры расчёта материалов, введённые покупателем вручную. Все измерители
/// необязательны — считается только то, что заполнено (пустые сводятся к нулю и
/// отсеиваются бэкендом). Клиент лишь собирает ввод; количества считает бэкенд.
class EstimateParams {
  const EstimateParams({
    this.area,
    this.volume,
    this.length,
    this.height,
    this.count,
    this.note,
  });

  /// Площадь, м².
  final num? area;

  /// Объём, м³.
  final num? volume;

  /// Длина, м.
  final num? length;

  /// Высота, м.
  final num? height;

  /// Количество, шт.
  final num? count;

  /// Свободная заметка (необязательно).
  final String? note;

  /// Задан ли хотя бы один измеритель с положительным значением.
  bool get hasAnyMeasure =>
      [area, volume, length, height, count].any((v) => v != null && v > 0);
}
