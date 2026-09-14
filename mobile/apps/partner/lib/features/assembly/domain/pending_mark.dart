import 'assembly_item_status.dart';

/// Отметка по позиции, которая ещё не доехала до сервера: склад бывает без
/// сети, а отметка сборщика — единственный след ручной работы, терять её
/// нельзя. Хранится на телефоне до успешной отправки (см. `PendingMarkStore`).
///
/// Ключ отметки — пара «задание + позиция»: по одной позиции держим только
/// последнее решение сборщика (передумал — уходит одно значение, а не история).
class PendingMark {
  const PendingMark({
    required this.taskId,
    required this.itemId,
    required this.status,
    required this.pickedQuantity,
    required this.createdAt,
  });

  final String taskId;
  final String itemId;

  /// Отметка: набрано целиком / частично / нет в наличии. `pending` сюда не
  /// попадает — снять отметку нельзя.
  final AssemblyItemStatus status;

  /// Сколько набрано (для `partial`; у `picked` — всё, у `missing` — 0).
  final int pickedQuantity;

  /// Когда сборщик нажал кнопку — очередь отправляется в этом же порядке.
  final DateTime createdAt;

  /// Ключ дедупликации.
  String get key => '$taskId/$itemId';

  Map<String, dynamic> toJson() => {
    'task_id': taskId,
    'item_id': itemId,
    'status': status.name,
    'picked_quantity': pickedQuantity,
    'created_at': createdAt.toIso8601String(),
  };

  /// Разбор записи из хранилища; null — запись битая (её отбрасываем, а не
  /// роняем весь экран).
  static PendingMark? fromJson(Object? raw) {
    if (raw is! Map) {
      return null;
    }
    final taskId = raw['task_id'];
    final itemId = raw['item_id'];
    final status = AssemblyItemStatus.parse(raw['status'] as String?);
    final createdAt = DateTime.tryParse('${raw['created_at']}');
    if (taskId is! String || itemId is! String || createdAt == null) {
      return null;
    }
    if (!status.isMarked) {
      return null;
    }
    return PendingMark(
      taskId: taskId,
      itemId: itemId,
      status: status,
      pickedQuantity: (raw['picked_quantity'] as num?)?.toInt() ?? 0,
      createdAt: createdAt,
    );
  }
}
