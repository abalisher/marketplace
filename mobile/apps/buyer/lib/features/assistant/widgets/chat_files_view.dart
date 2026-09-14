import 'package:flutter/material.dart';
import 'package:ui_kit/app_attachment_thumb.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_radius.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_typography.dart';

import '../domain/chat_file.dart';

/// Превью вложений ОТПРАВЛЕННОЙ реплики покупателя (T10.4c): в его пузыре над
/// текстом. Кадр видно целиком, файл — листом с именем: покупатель должен
/// узнать в ленте, какой именно снимок он приложил.
///
/// Живут в памяти: в сохранённую историю диалога вложения не пишем — три кадра
/// по 8 МБ выбили бы хранилище устройства, а бэкенду файл уходит ровно один
/// раз (он виден модели только в том ходе, с которым его прислали).
class ChatFilesView extends StatelessWidget {
  const ChatFilesView({required this.files, super.key});

  final List<ChatFile> files;

  /// Сторона превью кадра в пузыре.
  static const double thumbSide = 96;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Wrap(
      spacing: AppSpacing.sm,
      runSpacing: AppSpacing.sm,
      children: [
        for (final file in files)
          if (file.isImage)
            AppAttachmentThumb(
              bytes: file.bytes,
              isImage: true,
              size: thumbSide,
              iconSize: 24,
            )
          else
            Container(
              constraints: const BoxConstraints(maxWidth: 220),
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: colors.surface,
                borderRadius: BorderRadius.circular(AppRadius.chip),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  AppAttachmentThumb(
                    bytes: file.bytes,
                    isImage: false,
                    size: 32,
                    iconSize: 16,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Flexible(
                    child: Text(
                      file.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTypography.bodyMedium.copyWith(
                        color: colors.ink,
                      ),
                    ),
                  ),
                ],
              ),
            ),
      ],
    );
  }
}
