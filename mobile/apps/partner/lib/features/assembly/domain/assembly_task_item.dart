import 'assembly_item_status.dart';

/// Позиция задания сборки — строка экрана «что взять с полки»: что за товар,
/// сколько нужно, сколько набрали и какая по ней отметка. Презентационная
/// модель: экраны зависят от неё, а не от сгенерированных DTO (та же граница,
/// что у каталога/заказов в buyer).
class AssemblyTaskItem {
  const AssemblyTaskItem({
    required this.id,
    required this.orderItemId,
    required this.title,
    required this.quantity,
    required this.pickedQuantity,
    required this.status,
    this.sku,
    this.note,
  });

  final String id;
  final String orderItemId;

  /// Название товара — снапшот на момент распада заказа.
  final String title;

  /// Артикул; null — у варианта его нет.
  final String? sku;

  /// Сколько нужно набрать.
  final int quantity;

  /// Сколько набрано по последней отметке.
  final int pickedQuantity;

  final AssemblyItemStatus status;

  /// Комментарий сборщика (обычно причина нехватки).
  final String? note;

  AssemblyTaskItem copyWith({
    AssemblyItemStatus? status,
    int? pickedQuantity,
    String? note,
  }) {
    return AssemblyTaskItem(
      id: id,
      orderItemId: orderItemId,
      title: title,
      sku: sku,
      quantity: quantity,
      pickedQuantity: pickedQuantity ?? this.pickedQuantity,
      status: status ?? this.status,
      note: note ?? this.note,
    );
  }
}
