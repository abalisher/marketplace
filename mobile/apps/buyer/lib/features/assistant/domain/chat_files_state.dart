import 'chat_file.dart';
import 'chat_file_failure.dart';

/// Вложения, набранные для СЛЕДУЮЩЕЙ реплики (T10.4c). Живут до отправки:
/// покупатель снял не тот кадр — убирает его крестиком, доснимает ещё один и
/// только потом жмёт отправку.
class ChatFilesState {
  const ChatFilesState({
    this.files = const [],
    this.failure,
    this.isPicking = false,
  });

  final List<ChatFile> files;

  /// Последняя неудача выбора; экран показывает её текстом до следующей
  /// попытки.
  final ChatFileFailure? failure;

  /// Системный выбор ещё идёт (камера открыта, файл читается): композер
  /// показывает ожидание вместо «ничего не произошло» — на восьмимегабайтном
  /// PDF пауза заметна.
  final bool isPicking;

  bool get isEmpty => files.isEmpty;

  /// Сколько ещё файлов поместится в ход.
  int get freeSlots => ChatFile.maxFilesPerTurn - files.length;

  /// [failure] сбрасывается явно — `clearFailure: true`, иначе прошлый отказ
  /// висел бы под композером всю сессию.
  ChatFilesState copyWith({
    List<ChatFile>? files,
    ChatFileFailure? failure,
    bool clearFailure = false,
    bool? isPicking,
  }) {
    return ChatFilesState(
      files: files ?? this.files,
      failure: clearFailure ? null : (failure ?? this.failure),
      isPicking: isPicking ?? this.isPicking,
    );
  }
}
