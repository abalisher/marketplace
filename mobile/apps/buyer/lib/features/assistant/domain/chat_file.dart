import 'dart:typed_data';

/// Вложение реплики покупателя (T10.4c): снимок листа от прораба, фото объекта
/// или PDF. Уходит в теле хода ассистента base64 и нигде не сохраняется — то же
/// обещание, что у голоса (T10.2): файл живёт ровно один ход.
///
/// НЕ путать с `ChatAttachment` — там вставки, которые ассистент кладёт В ленту
/// (карточка товара, оплата, статус); движение в обратную сторону.
class ChatFile {
  const ChatFile({
    required this.id,
    required this.name,
    required this.mimeType,
    required this.bytes,
  });

  /// Локальный ключ вложения: по нему его убирают крестиком до отправки.
  final String id;

  /// Имя файла — только для показа в ленте, модели оно не уходит.
  final String name;

  /// Тип содержимого, УЖЕ приведённый к тому, что принимает бэкенд.
  final String mimeType;

  final Uint8List bytes;

  int get size => bytes.length;

  /// Кадр рисуем превью, PDF — листом с именем.
  bool get isImage => mimeType != pdfMimeType;

  static const pdfMimeType = 'application/pdf';

  /// Пределы вложений хода. Совпадают с серверными
  /// (`backend/src/lib/assistant/file-input.ts`): один файл — 8 МБ, за ход —
  /// не больше трёх и суммарно 12 МБ (всё вложенное уходит к модели одним
  /// телом). Держим их на клиенте, чтобы отказ был виден ДО отправки:
  /// «файл великоват» после восьмимегабайтной загрузки читается как поломка.
  static const maxFileBytes = 8 * 1024 * 1024;
  static const maxTurnBytes = 12 * 1024 * 1024;
  static const maxFilesPerTurn = 3;

  /// Что принимаем: снимки с телефона и из галереи (heic — формат камеры
  /// iPhone по умолчанию) и PDF. Ключ — базовый тип от системы выбора файла,
  /// значение — то, что уходит на бэкенд.
  static const mimeTypes = <String, String>{
    'image/jpeg': 'image/jpeg',
    'image/jpg': 'image/jpeg',
    'image/pjpeg': 'image/jpeg',
    'image/png': 'image/png',
    'image/webp': 'image/webp',
    'image/heic': 'image/heic',
    'image/heif': 'image/heif',
    pdfMimeType: pdfMimeType,
  };

  /// Тип по расширению — на случай, когда система отдала файл БЕЗ типа: часть
  /// файловых менеджеров Android не знает heic, а иногда молчит и про jpeg.
  static const extensionTypes = <String, String>{
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'heic': 'image/heic',
    'heif': 'image/heif',
    'pdf': pdfMimeType,
  };

  /// Расширения для системного диалога выбора файла.
  static const allowedExtensions = [
    'jpg',
    'jpeg',
    'png',
    'webp',
    'heic',
    'heif',
    'pdf',
  ];

  /// Таблицы и документы с текстовым слоем: зрительной моделью их НЕ читаем —
  /// требование T11.1 (цифры сметы берёт детерминированный парсер, а не догадка
  /// модели). Отказ по ним отдельный: покупателю есть что сделать прямо сейчас.
  static const tableMimeTypes = <String>{
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',
  };

  static const tableExtensions = <String>{
    'csv',
    'xls',
    'xlsx',
    'ods',
    'doc',
    'docx',
    'odt',
  };
}
