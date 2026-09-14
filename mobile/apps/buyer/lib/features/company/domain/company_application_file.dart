import 'dart:typed_data';

/// Файл, приложенный к заявке юрлица на устройстве (ещё не отправлен).
/// Ограничения повторяют контракт `StoreCreateCompany.files`: до 4 файлов по
/// 3 МБ, только PDF/JPEG/PNG. Проверку всё равно делает бэкенд — здесь она
/// нужна, чтобы не гнать заведомо отказной запрос и сказать это на месте.
class CompanyApplicationFile {
  const CompanyApplicationFile({
    required this.name,
    required this.mimeType,
    required this.bytes,
  });

  /// Максимум файлов в заявке.
  static const maxFiles = 4;

  /// Максимальный размер одного файла до кодирования, байт.
  static const maxSizeBytes = 3 * 1024 * 1024;

  /// Допустимые типы содержимого (значения enum контракта).
  static const allowedMimeTypes = <String>[
    'application/pdf',
    'image/jpeg',
    'image/png',
  ];

  /// Расширения для диалога выбора файлов — те же типы, что выше.
  static const allowedExtensions = <String>['pdf', 'jpg', 'jpeg', 'png'];

  /// Имя файла, которое увидит модератор.
  final String name;

  /// MIME-тип из [allowedMimeTypes].
  final String mimeType;

  /// Содержимое файла.
  final Uint8List bytes;
}
