import '../domain/chat_file_source.dart';
import '../domain/picked_chat_file.dart';

/// Граница системного выбора вложения. Вынесена из контроллера, чтобы путь
/// «скрепка → превью → отправка» прогонялся в тестах без камеры и файлового
/// менеджера; реализация по умолчанию — [PlatformChatFilePicker].
abstract interface class ChatFilePicker {
  /// Открывает нужный системный путь. Пустой список — покупатель передумал.
  /// Отказ в доступе или сбой устройства приходит [ChatFileException] —
  /// молчащая скрепка худший из исходов.
  Future<List<PickedChatFile>> pick(ChatFileSource source);
}
