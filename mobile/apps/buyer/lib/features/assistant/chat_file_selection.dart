import 'domain/chat_file.dart';
import 'domain/chat_file_failure.dart';
import 'domain/picked_chat_file.dart';

/// Итог отсева выбранных файлов: что уйдёт с репликой и причина отказа ПЕРВОГО
/// непринятого файла. Годные при этом сохраняются: покупатель отметил три кадра
/// листа, четвёртым случайно захватил видео — терять из-за этого первые три
/// нельзя. Перечень отказов на все файлы читать незачем — говорим об одной
/// причине.
class ChatFileSelection {
  const ChatFileSelection({required this.files, this.failure});

  final List<ChatFile> files;
  final ChatFileFailure? failure;
}

String _extensionOf(String name) {
  final dot = name.lastIndexOf('.');
  return dot == -1 ? '' : name.substring(dot + 1).toLowerCase();
}

/// Базовый тип без параметров и в нижнем регистре («image/jpeg» из
/// «IMAGE/JPEG; charset=binary»).
String _baseType(String raw) => raw.split(';').first.trim().toLowerCase();

/// Таблицу узнаём и по типу, и по расширению: покупатель, который тянет
/// «смета.xlsx», должен получить осмысленный ответ, а не «неизвестный формат».
bool _isTable(PickedChatFile file) =>
    ChatFile.tableMimeTypes.contains(_baseType(file.mimeType)) ||
    ChatFile.tableExtensions.contains(_extensionOf(file.name));

String? _resolveMimeType(PickedChatFile file) =>
    ChatFile.mimeTypes[_baseType(file.mimeType)] ??
    ChatFile.extensionTypes[_extensionOf(file.name)];

/// Проверяет выбранные файлы по правилам бэкенда и складывает годные к уже
/// набранным. Проверку всё равно делает сервер — здесь она нужна, чтобы отказ
/// был виден ДО отправки мегабайтов.
///
/// [nextId] — источник локальных ключей вложений (в тестах предсказуемый).
ChatFileSelection acceptChatFiles({
  required List<ChatFile> current,
  required List<PickedChatFile> picked,
  required String Function() nextId,
}) {
  final files = [...current];
  var turnBytes = files.fold<int>(0, (sum, file) => sum + file.size);
  ChatFileFailure? failure;

  for (final file in picked) {
    if (files.length >= ChatFile.maxFilesPerTurn) {
      failure ??= ChatFileFailure.tooMany;
      break;
    }
    if (_isTable(file)) {
      failure ??= ChatFileFailure.table;
      continue;
    }
    final mimeType = _resolveMimeType(file);
    if (mimeType == null) {
      failure ??= ChatFileFailure.type;
      continue;
    }
    if (file.bytes.isEmpty) {
      failure ??= ChatFileFailure.failed;
      continue;
    }
    if (file.bytes.length > ChatFile.maxFileBytes) {
      failure ??= ChatFileFailure.tooLarge;
      continue;
    }
    if (turnBytes + file.bytes.length > ChatFile.maxTurnBytes) {
      failure ??= ChatFileFailure.turnTooLarge;
      continue;
    }
    turnBytes += file.bytes.length;
    files.add(
      ChatFile(
        id: nextId(),
        name: file.name,
        mimeType: mimeType,
        bytes: file.bytes,
      ),
    );
  }

  return ChatFileSelection(files: files, failure: failure);
}
