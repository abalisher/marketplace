import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_radius.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// Строка списка диалогов в рельсе истории (бриф T10.1 §3.1): название в одну
/// строку с обрезкой, активный диалог — подложка `accent-container` и текст
/// акцентом. [trailing] — слот под кнопку меню строки «⋮» (на мобильном видна
/// всегда: наведения нет). История хранится локально на устройстве.
class AppHistoryItem extends StatelessWidget {
  const AppHistoryItem({
    required this.title,
    this.meta,
    this.active = false,
    this.onTap,
    this.trailing,
    super.key,
  });

  final String title;
  final String? meta;
  final bool active;
  final VoidCallback? onTap;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Material(
      color: active ? colors.accentContainer : Colors.transparent,
      borderRadius: BorderRadius.circular(AppRadius.chip),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.chip),
        child: Container(
          constraints: const BoxConstraints(minHeight: 48),
          padding: EdgeInsets.only(
            left: AppSpacing.md,
            right: trailing == null ? AppSpacing.md : AppSpacing.xs,
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AppTypography.bodyLargeMedium.copyWith(
                        color: active ? colors.accent : colors.ink,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (meta != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        meta!,
                        style: AppTypography.caption.copyWith(
                          color: colors.inkSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
              ?trailing,
            ],
          ),
        ),
      ),
    );
  }
}
