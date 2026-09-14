import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_radius.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// Одна строка карточки документов: название, номер и ссылка на PDF.
class AppDocumentEntry {
  const AppDocumentEntry({
    required this.title,
    required this.number,
    this.onOpen,
  });

  /// «Счёт на оплату», «Накладная», «Акт выполненных работ (внутренний)».
  final String title;

  /// Человекочитаемый номер: «INV-2026-000001».
  final String number;

  /// Открыть PDF. null — файл ещё готовится, строка показывается без действия.
  final VoidCallback? onOpen;
}

/// Карточка документов заказа в ленте чата: список выпущенных документов со
/// ссылками на PDF. Появилась по замечанию владельца («нажал „Нужны
/// документы“, но не получил накладную») — ассистент говорил «сформированы», а
/// файлов в диалоге не было.
class AppDocumentsCard extends StatelessWidget {
  const AppDocumentsCard({
    required this.title,
    required this.documents,
    required this.openLabel,
    this.pendingLabel,
    super.key,
  });

  /// Заголовок карточки: «Документы по заказу №24».
  final String title;

  final List<AppDocumentEntry> documents;

  /// Подпись действия открытия файла («Открыть PDF»).
  final String openLabel;

  /// Подпись для документа без файла («файл готовится»).
  final String? pendingLabel;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Container(
      margin: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: colors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AppTypography.titleMedium.copyWith(color: colors.ink),
          ),
          const SizedBox(height: AppSpacing.sm),
          for (final document in documents)
            Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.sm),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
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
                        Text(
                          document.title,
                          style: AppTypography.bodyMediumSemibold.copyWith(
                            color: colors.ink,
                          ),
                        ),
                        Text(
                          document.number,
                          style: AppTypography.caption.copyWith(
                            color: colors.inkSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  // Тап-таргет ≥48 dp: ссылка — кнопка, а не текст.
                  if (document.onOpen != null)
                    TextButton(
                      onPressed: document.onOpen,
                      child: Text(openLabel),
                    )
                  else if (pendingLabel != null)
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        vertical: AppSpacing.sm,
                      ),
                      child: Text(
                        pendingLabel!,
                        style: AppTypography.caption.copyWith(
                          color: colors.inkSecondary,
                        ),
                      ),
                    ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
