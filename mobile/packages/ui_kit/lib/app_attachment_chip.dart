import 'dart:typed_data';

import 'package:flutter/material.dart';

import 'app_attachment_thumb.dart';
import 'app_color_tokens.dart';
import 'app_radius.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// Выбранное вложение в композере (T10.4): превью, имя файла и крестик. Стоит
/// НАД полем ввода, внутри той же пилюли, — покупатель должен видеть, что
/// именно уйдёт вместе с репликой, и успеть передумать до отправки.
class AppAttachmentChip extends StatelessWidget {
  const AppAttachmentChip({
    required this.name,
    required this.bytes,
    required this.isImage,
    required this.onRemove,
    required this.removeLabel,
    super.key,
  });

  final String name;
  final Uint8List bytes;
  final bool isImage;
  final VoidCallback onRemove;

  /// Озвучка крестика для screen reader (у кнопки только иконка).
  final String removeLabel;

  /// Сторона крестика: тап-таргет меньше 40px на прогоне 2026-08-13
  /// промахивался пальцем.
  static const double removeSide = 40;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Container(
      constraints: const BoxConstraints(maxWidth: 240),
      decoration: BoxDecoration(
        color: colors.surfaceDim,
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: colors.border),
      ),
      padding: const EdgeInsets.all(AppSpacing.xs),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          AppAttachmentThumb(
            bytes: bytes,
            isImage: isImage,
            size: 32,
            iconSize: 16,
          ),
          const SizedBox(width: AppSpacing.sm),
          Flexible(
            child: Text(
              name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTypography.bodyMedium.copyWith(color: colors.ink),
            ),
          ),
          Semantics(
            button: true,
            label: '$removeLabel: $name',
            child: Material(
              color: Colors.transparent,
              shape: const CircleBorder(),
              child: InkWell(
                onTap: onRemove,
                customBorder: const CircleBorder(),
                child: SizedBox(
                  width: removeSide,
                  height: removeSide,
                  child: Icon(
                    Icons.close_rounded,
                    size: 16,
                    color: colors.inkSecondary,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
