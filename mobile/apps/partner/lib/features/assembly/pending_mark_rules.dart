import 'domain/assembly_task.dart';
import 'domain/assembly_task_item.dart';
import 'domain/pending_mark.dart';

/// Правила очереди неотправленных отметок — чистые функции без сети и хранилища
/// (идиома `split.ts` на бэкенде: всё, что можно проверить юнитом, живёт
/// отдельно от ввода-вывода).

/// Кладёт отметку в очередь. По паре «задание + позиция» держим ТОЛЬКО
/// последнее решение сборщика: передумал и перещёлкнул — на сервер уедет одно
/// значение, а не история нажатий. Позиция очереди при замене сохраняется —
/// порядок отправки остаётся тем, в котором сборщик шёл по полкам.
List<PendingMark> mergePendingMark(List<PendingMark> queue, PendingMark mark) {
  final merged = [...queue];
  final index = merged.indexWhere((existing) => existing.key == mark.key);
  if (index >= 0) {
    merged[index] = mark;
  } else {
    merged.add(mark);
  }
  return merged;
}

/// Убирает из очереди отметки, которые уже уехали на сервер.
List<PendingMark> removePendingMarks(
  List<PendingMark> queue,
  Iterable<PendingMark> sent,
) {
  final keys = sent.map((mark) => mark.key).toSet();
  return queue.where((mark) => !keys.contains(mark.key)).toList();
}

/// Отметки одного задания в порядке очереди.
List<PendingMark> pendingMarksOf(List<PendingMark> queue, String taskId) =>
    queue.where((mark) => mark.taskId == taskId).toList();

/// Накладывает неотправленные отметки на задание, полученное с сервера: экран
/// показывает то, что сборщик уже отметил, даже если сеть пропала. Счётчики
/// пересчитываются здесь же — иначе прогресс «отмечено 2 из 5» врал бы.
AssemblyTask applyPendingMarks(AssemblyTask task, List<PendingMark> marks) {
  if (marks.isEmpty) {
    return task;
  }
  final byItem = {
    for (final mark in marks)
      if (mark.taskId == task.id) mark.itemId: mark,
  };
  if (byItem.isEmpty) {
    return task;
  }

  final items = <AssemblyTaskItem>[];
  for (final item in task.items) {
    final mark = byItem[item.id];
    items.add(
      mark == null
          ? item
          : item.copyWith(
              status: mark.status,
              pickedQuantity: mark.pickedQuantity,
            ),
    );
  }

  return task.copyWith(
    items: items,
    itemsMarked: items.where((item) => item.status.isMarked).length,
    itemsShortage: items.where((item) => item.status.isShortage).length,
  );
}
