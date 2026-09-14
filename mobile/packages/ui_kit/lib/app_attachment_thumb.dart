import 'dart:typed_data';

import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_radius.dart';

/// Квадратное превью вложения покупателя (T10.4): кадр — самой картинкой,
/// PDF — листом. Рисуется из ТЕХ ЖЕ байтов, что уходят на бэкенд: временный
/// файл или URL завёл бы жизненный цикл (кто и когда его удаляет), а вложений
/// за ход всего три.
///
/// Отдельный виджет, потому что превью нужно в двух местах: чипом в композере
/// до отправки и в пузыре реплики после неё.
///
/// Картинку показываем ОПТИМИСТИЧНО и падаем на лист по ошибке декодера: heic
/// со снимка iPhone бэкенд принимает, а Flutter на части платформ не рисует —
/// и это не повод прятать вложение из ленты.
class AppAttachmentThumb extends StatelessWidget {
  const AppAttachmentThumb({
    required this.bytes,
    required this.isImage,
    this.size = 40,
    this.iconSize = 20,
    super.key,
  });

  final Uint8List bytes;

  /// Кадр (рисуем картинку) или файл (рисуем лист).
  final bool isImage;

  final double size;
  final double iconSize;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(AppRadius.chip),
      child: SizedBox(
        width: size,
        height: size,
        child: isImage
            ? Image.memory(
                bytes,
                fit: BoxFit.cover,
                errorBuilder: (_, _, _) => _Sheet(iconSize: iconSize),
              )
            : _Sheet(iconSize: iconSize),
      ),
    );
  }
}

/// Заглушка «файл»: нейтральный фон с листом.
class _Sheet extends StatelessWidget {
  const _Sheet({required this.iconSize});

  final double iconSize;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return ColoredBox(
      color: colors.surfaceDim,
      child: Icon(
        Icons.description_outlined,
        size: iconSize,
        color: colors.inkSecondary,
      ),
    );
  }
}
