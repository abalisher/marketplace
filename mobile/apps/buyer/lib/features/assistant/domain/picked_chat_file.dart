import 'dart:typed_data';

/// Файл ровно в том виде, в каком его отдало устройство: тип может прийти с
/// параметрами, в любом регистре или пустым (часть файловых менеджеров Android
/// молчит про тип). Приведением и отсевом занимается `chat_file_selection.dart`
/// — так системный выбор файла остаётся заменимым в тестах.
class PickedChatFile {
  const PickedChatFile({
    required this.name,
    required this.mimeType,
    required this.bytes,
  });

  final String name;

  /// Тип как его отдала система; пустая строка — типа нет, решает расширение.
  final String mimeType;

  final Uint8List bytes;
}
