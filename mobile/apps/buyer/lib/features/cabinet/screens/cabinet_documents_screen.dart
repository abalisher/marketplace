import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ui_kit/app_card.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_loader.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_typography.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../l10n/messages.dart';
import '../../../l10n/messages_provider.dart';
import '../../../shared/date_label.dart';
import '../../../shared/tenge.dart';
import '../domain/buyer_document.dart';
import '../domain/cabinet_section.dart';
import '../providers/my_documents_provider.dart';
import '../widgets/cabinet_scaffold.dart';

/// Раздел «Документы» кабинета (T10.6): счета, накладные и акты по ВСЕМ заказам
/// одним списком. Раздел существует ровно затем, чтобы найти накладную, не
/// вспоминая, в каком заказе она была; из строки можно уйти в карточку заказа.
class CabinetDocumentsScreen extends ConsumerWidget {
  const CabinetDocumentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = ref.watch(messagesProvider);
    final documentsAsync = ref.watch(myDocumentsProvider);

    return CabinetScaffold(
      section: CabinetSection.documents,
      child: documentsAsync.when(
        loading: () => const AppLoader(),
        error: (_, _) => AppErrorView(
          message: t.cabinetDocumentsLoadError,
          retryLabel: t.retry,
          onRetry: () => ref.invalidate(myDocumentsProvider),
        ),
        data: (documents) => _DocumentsBody(documents: documents),
      ),
    );
  }
}

class _DocumentsBody extends ConsumerWidget {
  const _DocumentsBody({required this.documents});

  final List<BuyerDocument> documents;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = ref.watch(messagesProvider);
    final colors = AppColorTokens.of(context);

    if (documents.isEmpty) {
      return Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              t.cabinetDocumentsEmpty,
              style: AppTypography.titleMedium.copyWith(color: colors.ink),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              t.cabinetDocumentsEmptyHint,
              style: AppTypography.bodyLarge.copyWith(
                color: colors.inkSecondary,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        0,
        AppSpacing.lg,
        AppSpacing.lg,
      ),
      itemCount: documents.length,
      separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.sm),
      itemBuilder: (context, i) => _row(context, t, colors, documents[i]),
    );
  }

  Widget _row(
    BuildContext context,
    Messages t,
    AppColorTokens colors,
    BuyerDocument document,
  ) {
    final meta = [
      if (document.orderDisplayNumber != null)
        t.cabinetDocumentOrder(document.orderDisplayNumber!),
      if (document.createdAt != null) formatDateLabel(document.createdAt!),
      if (document.total != null) formatTenge(document.total!.round()),
    ].join(' · ');

    return AppCard(
      // Тап по карточке — в заказ: документ почти всегда ищут «от заказа», и
      // из списка надо уметь вернуться в карточку.
      onTap: () => context.push('/cabinet/orders/${document.orderId}'),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${t.orderDocumentType(document.type)} · ${document.number}',
                  style: AppTypography.bodyLargeSemibold.copyWith(
                    color: colors.ink,
                  ),
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  meta,
                  style: AppTypography.caption.copyWith(
                    color: colors.inkSecondary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          if (document.hasFile)
            IconButton(
              onPressed: () => _open(context, t, document.fileUrl!),
              icon: const Icon(Icons.picture_as_pdf_outlined),
              tooltip: t.orderDocumentPdf,
              color: colors.accent,
            )
          else
            Text(
              t.cabinetDocumentPreparing,
              style: AppTypography.caption.copyWith(color: colors.inkSecondary),
            ),
        ],
      ),
    );
  }

  /// Открытие PDF во внешнем приложении — тот же порядок, что у вставки
  /// документов в ленте: проверяем схему, ошибку показываем тостом (молчащая
  /// кнопка выглядит как сломанная).
  Future<void> _open(BuildContext context, Messages t, String rawUrl) async {
    final url = Uri.tryParse(rawUrl);
    final ok = url != null && (url.isScheme('http') || url.isScheme('https'));
    final messenger = ScaffoldMessenger.of(context);
    try {
      final launched =
          ok && await launchUrl(url, mode: LaunchMode.externalApplication);
      if (!launched && context.mounted) {
        messenger.showSnackBar(
          SnackBar(content: Text(t.orderDocumentOpenError)),
        );
      }
    } catch (_) {
      if (context.mounted) {
        messenger.showSnackBar(
          SnackBar(content: Text(t.orderDocumentOpenError)),
        );
      }
    }
  }
}
