import 'package:flutter/material.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages.dart';
import '../domain/chat_file_source.dart';

/// Лист выбора источника вложения (T10.4c). На телефоне это три РАЗНЫХ
/// системных пути, и выбирать между ними должен покупатель: снять лист прямо
/// сейчас, достать вчерашний кадр из галереи или приложить PDF-смету. В вебе
/// такого выбора нет вовсе — там один системный диалог, поэтому лист живёт в
/// приложении, а не в `ui_kit`.
///
/// Возвращает `null`, если покупатель закрыл лист, не выбрав ничего.
Future<ChatFileSource?> showChatFileSourceSheet(
  BuildContext context,
  Messages t,
) {
  final colors = AppColorTokens.of(context);
  return showModalBottomSheet<ChatFileSource>(
    context: context,
    backgroundColor: colors.surface,
    showDragHandle: true,
    builder: (context) => SafeArea(
      top: false,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              0,
              AppSpacing.lg,
              AppSpacing.sm,
            ),
            child: Text(
              t.filesSourceTitle,
              style: AppTypography.titleMediumBold.copyWith(color: colors.ink),
            ),
          ),
          _SourceTile(
            icon: Icons.photo_camera_outlined,
            label: t.filesSourceCamera,
            source: ChatFileSource.camera,
          ),
          _SourceTile(
            icon: Icons.photo_library_outlined,
            label: t.filesSourceGallery,
            source: ChatFileSource.gallery,
          ),
          _SourceTile(
            icon: Icons.description_outlined,
            label: t.filesSourceFile,
            source: ChatFileSource.file,
          ),
          const SizedBox(height: AppSpacing.sm),
        ],
      ),
    ),
  );
}

/// Одна строка листа: иконка и название пути.
class _SourceTile extends StatelessWidget {
  const _SourceTile({
    required this.icon,
    required this.label,
    required this.source,
  });

  final IconData icon;
  final String label;
  final ChatFileSource source;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return ListTile(
      leading: Icon(icon, color: colors.inkSecondary),
      title: Text(
        label,
        style: AppTypography.bodyLarge.copyWith(color: colors.ink),
      ),
      onTap: () => Navigator.of(context).pop(source),
    );
  }
}
