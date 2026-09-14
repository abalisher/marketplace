import 'package:file_picker/file_picker.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';

import '../domain/chat_file.dart';
import '../domain/chat_file_failure.dart';
import '../domain/chat_file_source.dart';
import '../domain/picked_chat_file.dart';
import 'chat_file_exception.dart';
import 'chat_file_picker.dart';

/// Сколько пикселей оставляем от снимка камеры и галереи. Лист А4 в 2048 px по
/// длинной стороне — это ~175 dpi: рукописный список читается, а кадр
/// укладывается в серверный предел 8 МБ (телефоны на 108 Мп отдают и по 15 МБ,
/// и покупателю нечего было бы с таким отказом делать). Модель всё равно
/// работает с картинкой в тайлах меньшего размера.
const _maxImageSide = 2048.0;
const _imageQuality = 90;

/// Системный выбор вложения на устройстве (T10.4c): камера и галерея — через
/// `image_picker` (он же спрашивает разрешения), произвольный файл — через
/// `file_picker`. Содержимое запрашиваем сразу байтами: ход уходит в JSON
/// base64, а в вебе пути к файлу нет вовсе.
class PlatformChatFilePicker implements ChatFilePicker {
  PlatformChatFilePicker({ImagePicker? images})
    : _images = images ?? ImagePicker();

  final ImagePicker _images;

  @override
  Future<List<PickedChatFile>> pick(ChatFileSource source) async {
    switch (source) {
      case ChatFileSource.camera:
        return _fromImages(await _shoot());
      case ChatFileSource.gallery:
        return _fromImages(await _fromGallery());
      case ChatFileSource.file:
        return _files();
    }
  }

  Future<List<XFile>> _shoot() async {
    final shot = await _guard(
      () => _images.pickImage(
        source: ImageSource.camera,
        maxWidth: _maxImageSide,
        maxHeight: _maxImageSide,
        imageQuality: _imageQuality,
      ),
    );
    return shot == null ? const [] : [shot];
  }

  Future<List<XFile>> _fromGallery() => _guard(
    () => _images.pickMultiImage(
      // Больше трёх за ход всё равно не примем — просим ровно столько, сколько
      // поместится, и покупатель не выбирает вслепую лишнее.
      limit: ChatFile.maxFilesPerTurn,
      maxWidth: _maxImageSide,
      maxHeight: _maxImageSide,
      imageQuality: _imageQuality,
    ),
  );

  Future<List<PickedChatFile>> _files() async {
    final result = await _guard(
      () => FilePicker.platform.pickFiles(
        allowMultiple: true,
        withData: true,
        type: FileType.custom,
        allowedExtensions: ChatFile.allowedExtensions,
      ),
    );
    if (result == null) return const [];
    return [
      for (final file in result.files)
        if (file.bytes != null)
          PickedChatFile(
            name: file.name,
            // Тип отдаём пустым: file_picker его не сообщает, а по расширению
            // отсев разберётся сам.
            mimeType: '',
            bytes: file.bytes!,
          ),
    ];
  }

  Future<List<PickedChatFile>> _fromImages(List<XFile> shots) async {
    final picked = <PickedChatFile>[];
    for (final shot in shots) {
      picked.add(
        PickedChatFile(
          name: shot.name,
          mimeType: shot.mimeType ?? '',
          bytes: await _read(shot),
        ),
      );
    }
    return picked;
  }

  Future<Uint8List> _read(XFile shot) async {
    try {
      return await shot.readAsBytes();
    } catch (_) {
      throw const ChatFileException(ChatFileFailure.failed);
    }
  }

  /// Отказ в доступе к камере или галерее приходит от плагина
  /// [PlatformException] с говорящим кодом — превращаем его в причину, чтобы
  /// экран позвал покупателя в настройки, а не молчал.
  Future<T> _guard<T>(Future<T> Function() action) async {
    try {
      return await action();
    } on PlatformException catch (error) {
      throw ChatFileException(
        error.code.contains('access_denied')
            ? ChatFileFailure.denied
            : ChatFileFailure.failed,
      );
    } catch (_) {
      throw const ChatFileException(ChatFileFailure.failed);
    }
  }
}
