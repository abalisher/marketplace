import 'assembly_task.dart';
import 'assembly_task_status.dart';

/// Очередь заданий сборщика: страница заданий, счётчики по статусам для чипов
/// и группа-категория, которой ограничена выборка. Группу подставляет сервер
/// из учётки — клиент её не выбирает и не хранит.
class AssemblyQueue {
  const AssemblyQueue({
    required this.tasks,
    required this.total,
    required this.countsByStatus,
    this.group,
  });

  /// Пустая очередь — состояние до первой загрузки и после ошибки.
  const AssemblyQueue.empty()
    : tasks = const [],
      total = 0,
      countsByStatus = const {},
      group = null;

  final List<AssemblyTask> tasks;

  /// Сколько заданий всего при текущем фильтре без учёта статуса.
  final int total;

  /// Сколько заданий в каждом статусе — подписи чипов.
  final Map<AssemblyTaskStatus, int> countsByStatus;

  /// Handle категории сборщика; null — учётка видит все категории
  /// (полноценный сотрудник панели) либо группа не назначена.
  final String? group;

  /// Имя категории для заголовка. Берётся из заданий: справочника категорий на
  /// клиенте нет и заводить его нельзя — имя приходит снапшотом с сервера.
  /// Пока заданий нет, показывать нечего.
  String? get groupName => tasks.isEmpty ? null : tasks.first.categoryName;

  int countOf(AssemblyTaskStatus status) => countsByStatus[status] ?? 0;
}
