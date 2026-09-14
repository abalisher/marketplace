import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_loader.dart';
import 'package:ui_kit/app_order_status_block.dart';
import 'package:ui_kit/app_radius.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_typography.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../l10n/messages.dart';
import '../../../l10n/messages_provider.dart';
import '../../../shared/delivery_slot_label.dart';
import '../../../shared/order_stages.dart';
import '../../../shared/order_status_color.dart';
import '../../../shared/tenge.dart';
import '../domain/order_detail.dart';
import '../domain/order_document.dart';
import '../providers/orders_provider.dart';

/// Экран 1g «заказ-деталь»: таймлайн статуса (4 стадии) + код получения,
/// состав и итог, документы-основания (счёт/акт, открываются как PDF). Данные
/// из бэкенда; экран отображает.
class OrderDetailScreen extends ConsumerWidget {
  const OrderDetailScreen({required this.orderId, super.key});

  final String orderId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = ref.watch(messagesProvider);
    final detailAsync = ref.watch(orderDetailProvider(orderId));

    return Scaffold(
      appBar: AppBar(title: Text(t.myOrders)),
      body: detailAsync.when(
        loading: () => const AppLoader(),
        error: (_, _) => AppErrorView(
          message: t.ordersLoadError,
          retryLabel: t.retry,
          onRetry: () => ref.invalidate(orderDetailProvider(orderId)),
        ),
        data: (order) => _DetailBody(order: order, t: t),
      ),
    );
  }
}

class _DetailBody extends StatelessWidget {
  const _DetailBody({required this.order, required this.t});

  final OrderDetail order;
  final Messages t;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    final status = order.lifecycleStatus;
    final code = order.deliveryCode;
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        // Таймлайн статуса + код получения (переиспользуем блок ленты чата).
        AppOrderStatusBlock(
          orderNumber: order.displayNumber,
          statusLabel: status != null
              ? t.orderStatusLabel(status)
              : t.orderStatusUnknown,
          statusColor: orderStatusColor(status, colors),
          stages: orderStages(status, t),
          // Слот доставки (T5.6a): «когда привезут» — на самом экране заказа,
          // а не только в ответе ассистента.
          slotTitle: t.deliverySlotTitle,
          slotLabel: formatDeliverySlotLabel(
            order.deliveryDate,
            order.deliveryWindow,
            t,
          ),
          receiptCode: (code != null && code.isNotEmpty) ? code : null,
          codeLabel: (code != null && code.isNotEmpty)
              ? t.deliveryCodeTitle
              : null,
          courierNote: (code != null && code.isNotEmpty)
              ? t.deliveryCodeHint
              : null,
        ),
        const SizedBox(height: AppSpacing.lg),
        // Состав заказа.
        Text(t.orderItemsTitle, style: AppTypography.titleMedium),
        const SizedBox(height: AppSpacing.sm),
        _Panel(
          children: [
            for (var i = 0; i < order.lines.length; i++)
              _row(
                context,
                first: i == 0,
                label: '${order.lines[i].title} × ${order.lines[i].quantity}',
                value: formatTenge(order.lines[i].total.round()),
              ),
            _row(
              context,
              first: order.lines.isEmpty,
              label: t.cartTotal,
              value: formatTenge(order.total.round()),
              strong: true,
            ),
          ],
        ),
        // Документы-основания (счёт/акт).
        if (order.documents.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.lg),
          Text(t.orderDocumentsTitle, style: AppTypography.titleMedium),
          const SizedBox(height: AppSpacing.sm),
          _Panel(
            children: [
              for (var i = 0; i < order.documents.length; i++)
                _DocumentRow(document: order.documents[i], first: i == 0, t: t),
            ],
          ),
        ],
      ],
    );
  }

  /// Строка панели: метка слева, значение справа (tabular), разделитель сверху
  /// у всех, кроме первой. [strong] — итоговая строка (жирнее).
  Widget _row(
    BuildContext context, {
    required bool first,
    required String label,
    required String value,
    bool strong = false,
  }) {
    final colors = AppColorTokens.of(context);
    final style = strong
        ? AppTypography.titleMedium.copyWith(color: colors.ink)
        : AppTypography.bodyMedium.copyWith(color: colors.ink);
    return Container(
      constraints: const BoxConstraints(minHeight: 44),
      decoration: BoxDecoration(
        border: first ? null : Border(top: BorderSide(color: colors.border)),
      ),
      child: Row(
        children: [
          Expanded(child: Text(label, style: style)),
          const SizedBox(width: AppSpacing.sm),
          Text(value, style: style),
        ],
      ),
    );
  }
}

/// Панель-контейнер со скруглением и обводкой (карточка без теней — elevation
/// обводкой, решение T1.1). Строки внутри сами рисуют разделители.
class _Panel extends StatelessWidget {
  const _Panel({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: colors.border),
      ),
      child: Column(children: children),
    );
  }
}

/// Строка документа: иконка-файл, название (тип), номер; справа — «PDF»
/// (открывает файл) или «после доставки» (файла ещё нет). Тап открывает PDF во
/// внешнем приложении. Логики нет — только показ и запуск ссылки.
class _DocumentRow extends StatelessWidget {
  const _DocumentRow({
    required this.document,
    required this.first,
    required this.t,
  });

  final OrderDocument document;
  final bool first;
  final Messages t;

  Future<void> _open(BuildContext context, Messages t) async {
    if (!document.hasFile) return;
    final url = Uri.tryParse(document.fileUrl!);
    // Открываем только http(s)-ссылку (File Module отдаёт такие); чужую схему
    // не запускаем. Сбой запуска не роняет экран — показываем снекбар.
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

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return InkWell(
      onTap: document.hasFile ? () => _open(context, t) : null,
      child: Container(
        constraints: const BoxConstraints(minHeight: 48),
        decoration: BoxDecoration(
          border: first ? null : Border(top: BorderSide(color: colors.border)),
        ),
        child: Row(
          children: [
            Icon(
              Icons.description_outlined,
              size: 20,
              color: colors.inkSecondary,
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    t.orderDocumentType(document.type),
                    style: AppTypography.bodyMedium.copyWith(color: colors.ink),
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
            Text(
              document.hasFile ? t.orderDocumentPdf : t.orderDocumentPending,
              style: AppTypography.caption.copyWith(
                color: document.hasFile ? colors.accent : colors.inkSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
