import '../domain/pending_mark.dart';

/// Хранилище неотправленных отметок на устройстве. Абстракция: в проде —
/// `SharedPrefsPendingMarkStore`, в тестах — фейк в памяти. Очередь общая на
/// все задания и хранится целиком: отдельная запись на отметку не нужна, их
/// единицы, а атомарная перезапись списка проще и не оставляет полусостояний.
abstract interface class PendingMarkStore {
  /// Читает очередь; битые записи отбрасываются.
  Future<List<PendingMark>> read();

  /// Полностью перезаписывает очередь.
  Future<void> write(List<PendingMark> marks);
}
