import 'assembly_task_item.dart';
import 'assembly_task_status.dart';

/// Задание сборки: одна категория одного заказа. Счётчики приходят с сервера
/// готовыми (роут собирает строку экрана целиком), а при наложении
/// неотправленных отметок пересчитываются на месте — см. `applyPendingMarks`.
class AssemblyTask {
  const AssemblyTask({
    required this.id,
    required this.orderId,
    required this.categoryHandle,
    required this.categoryName,
    required this.status,
    required this.itemsTotal,
    required this.itemsMarked,
    required this.itemsShortage,
    required this.items,
    this.orderDisplayId,
    this.customerName,
    this.note,
  });

  final String id;
  final String orderId;

  /// Человекочитаемый номер заказа (#43); null — заказ его ещё не получил.
  final int? orderDisplayId;

  /// Покупатель — чтобы сборщик понимал, чей это заказ, на выдаче.
  final String? customerName;

  /// Категория-группа задания (handle) и её имя на момент распада.
  final String categoryHandle;
  final String categoryName;

  final AssemblyTaskStatus status;

  /// Сводка по позициям: сколько всего, сколько отмечено, сколько не набралось.
  final int itemsTotal;
  final int itemsMarked;
  final int itemsShortage;

  final List<AssemblyTaskItem> items;

  /// Комментарий по заданию (обычно причина нехватки).
  final String? note;

  /// По каждой позиции есть отметка — задание можно закрывать.
  bool get isFullyMarked => itemsTotal > 0 && itemsMarked == itemsTotal;

  AssemblyTask copyWith({
    AssemblyTaskStatus? status,
    int? itemsMarked,
    int? itemsShortage,
    List<AssemblyTaskItem>? items,
  }) {
    return AssemblyTask(
      id: id,
      orderId: orderId,
      orderDisplayId: orderDisplayId,
      customerName: customerName,
      categoryHandle: categoryHandle,
      categoryName: categoryName,
      status: status ?? this.status,
      itemsTotal: itemsTotal,
      itemsMarked: itemsMarked ?? this.itemsMarked,
      itemsShortage: itemsShortage ?? this.itemsShortage,
      items: items ?? this.items,
      note: note,
    );
  }
}
