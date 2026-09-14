import 'assembly_task_status.dart';

/// Чип очереди сборщика. Отдельный тип, а не просто [AssemblyTaskStatus]:
/// главный вид очереди — «что ещё делать», и он объединяет три статуса.
///
/// Почему по умолчанию не «все»: очередь идёт FIFO (старые сверху), поэтому
/// собранные задания прошлых смен оказывались бы НАД сегодняшней работой и
/// копились бы там бесконечно. Закрытые задания никуда не деваются — они за
/// своим чипом.
enum QueueFilter {
  /// Ожидает + собираю + нехватка: всё, по чему сборщику ещё есть работа
  /// (нехватка — рабочее состояние: довезли позицию, задание закрывают).
  active,
  pending,
  picking,
  shortage,
  assembled;

  /// Статусы, которые запрашиваются у сервера.
  List<AssemblyTaskStatus> get statuses {
    switch (this) {
      case QueueFilter.active:
        return const [
          AssemblyTaskStatus.pending,
          AssemblyTaskStatus.picking,
          AssemblyTaskStatus.shortage,
        ];
      case QueueFilter.pending:
        return const [AssemblyTaskStatus.pending];
      case QueueFilter.picking:
        return const [AssemblyTaskStatus.picking];
      case QueueFilter.shortage:
        return const [AssemblyTaskStatus.shortage];
      case QueueFilter.assembled:
        return const [AssemblyTaskStatus.assembled];
    }
  }
}
