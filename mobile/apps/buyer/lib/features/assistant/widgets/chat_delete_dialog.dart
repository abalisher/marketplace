import 'package:flutter/material.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages.dart';

/// Подтверждение удаления диалога из истории (бриф T10.1 §3.1): «Удалить
/// диалог? Его нельзя восстановить» → Удалить (danger) / Отмена. Удаление
/// необратимо, поэтому спрашиваем — раньше крестик в строке удалял молча.
abstract final class ChatDeleteDialog {
  /// Показывает подтверждение; возвращает true, если покупатель подтвердил.
  static Future<bool> show(BuildContext context, Messages t) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        final colors = AppColorTokens.of(context);
        return AlertDialog(
          title: Text(t.assistantRailDeleteTitle),
          content: Text(t.assistantRailDeleteBody),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: Text(
                t.assistantRailDeleteCancel,
                style: AppTypography.button.copyWith(
                  color: colors.inkSecondary,
                ),
              ),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: Text(
                t.assistantRailDeleteConfirm,
                style: AppTypography.button.copyWith(color: colors.error),
              ),
            ),
          ],
        );
      },
    );
    return confirmed ?? false;
  }
}
