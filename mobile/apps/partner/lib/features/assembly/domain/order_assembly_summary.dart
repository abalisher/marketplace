/// Агрегат сборки заказа — приходит в ответе на закрытие задания. Сборщику он
/// нужен ровно для одной фразы: заказ ушёл дальше или ждёт другие категории.
class OrderAssemblySummary {
  const OrderAssemblySummary({
    required this.tasksTotal,
    required this.tasksFinished,
    required this.isFinished,
    required this.isAssembled,
    required this.hasShortage,
  });

  final int tasksTotal;
  final int tasksFinished;

  /// По всем заданиям заказа отработали — отгрузка может передавать водителю.
  final bool isFinished;

  /// Заказ собран целиком (нехватки нет).
  final bool isAssembled;

  /// Хотя бы в одном задании нехватка.
  final bool hasShortage;

  /// Сколько категорий заказа ещё не закрыто.
  int get remaining => tasksTotal - tasksFinished;
}
