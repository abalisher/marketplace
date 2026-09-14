import 'package:flutter/material.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages.dart';
import '../domain/company_application_file.dart';

/// Строка выбранного, но ещё не отправленного файла: имя, размер и удаление
/// (тап-таргет 48 dp). Используется и первой заявкой, и правкой.
class CompanyPickedFileTile extends StatelessWidget {
  const CompanyPickedFileTile({
    required this.file,
    required this.messages,
    required this.onRemove,
    super.key,
  });

  final CompanyApplicationFile file;
  final Messages messages;
  final VoidCallback? onRemove;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        children: [
          Icon(
            Icons.description_outlined,
            size: 20,
            color: colors.inkSecondary,
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(file.name, style: AppTypography.bodyMedium),
                Text(
                  messages.companyFileSize(file.bytes.length),
                  style: AppTypography.caption.copyWith(
                    color: colors.inkSecondary,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: onRemove,
            tooltip: messages.companyRemoveFile,
            icon: const Icon(Icons.close),
          ),
        ],
      ),
    );
  }
}
