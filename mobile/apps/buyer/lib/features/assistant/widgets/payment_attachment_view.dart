import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_kaspi_pay_block.dart';
import 'package:ui_kit/app_radius.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages.dart';
import '../../../l10n/messages_provider.dart';
import '../../../shared/kaspi_pay_actions.dart';
import '../../../shared/tenge.dart';
import '../domain/chat_attachment.dart';
import '../domain/payment_status.dart';
import '../providers/payment_status_provider.dart';

/// Платёжная вставка Kaspi в ленте (экран 1c): сумма + оплата + статус, с
/// авто-поллингом статуса оплаты. Покупатель платит вне чата, поэтому карточка
/// сама опрашивает бэкенд ([paymentStatusProvider]) и обновляет статус на
/// «Оплачено», когда оплата прошла. Ошибка опроса — баннер с «Повторить»
/// (перезапуск потока). Логика опроса — в провайдере; виджет только отображает.
///
/// Здесь телефон — не сканер, а плательщик: главное действие — открыть счёт в
/// приложении Kaspi (ссылка `pay.kaspi.kz` универсальная), QR остаётся под
/// раскрывашкой для оплаты с соседнего устройства.
class PaymentAttachmentView extends ConsumerWidget {
  const PaymentAttachmentView({
    required this.attachment,
    required this.cartId,
    super.key,
  });

  final PaymentAttachment attachment;

  /// Токен корзины из состояния чата; null — опрашивать нечего (показываем
  /// статус из самой вставки).
  ///
  /// ИНВАРИАНТ (MVP): один диалог = одна корзина. Вставка не несёт собственный
  /// cartId (бэкенд вырезает внутренние id), поэтому поллинг идёт против
  /// текущего [cartId] чата. Это верно, пока в диалоге не создаётся несколько
  /// корзин: неоплаченные вставки привязаны только к последнему ответу
  /// ассистента (репозиторий очищает attachments у старых сообщений), а после
  /// оформления заказа бэкенд возвращает `cart_id: null` — поллинг глохнет.
  /// Расширение на несколько корзин за диалог потребует протаскивать cartId в
  /// саму вставку (ревью T2.4, находка №1).
  final String? cartId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = ref.watch(messagesProvider);
    final colors = AppColorTokens.of(context);

    // Живой статус: если оплата уже прошла (вставка paid) или корзины нет —
    // опрос не нужен. Иначе слушаем провайдер и отражаем актуальный статус.
    final live = attachment.paid || cartId == null
        ? null
        : ref.watch(paymentStatusProvider(cartId!));

    final effective = _resolve(live);
    final hasError = live?.hasError ?? false;

    // Действия живут только у неоплаченного счёта: после оплаты ссылка ведёт
    // в никуда, а кнопка «оплатить» рядом со статусом «Оплачено» сбивает.
    final awaiting = effective == PaymentStatus.pending;
    final payable = awaiting && (attachment.paymentUrl?.isNotEmpty ?? false);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AppKaspiPayBlock(
          amount: attachment.amount != null
              ? formatTenge(attachment.amount!)
              : null,
          qrData: attachment.qrPayload,
          statusLabel: _label(t, effective),
          statusColor: switch (effective) {
            PaymentStatus.paid => colors.success,
            PaymentStatus.failed => colors.error,
            PaymentStatus.pending => colors.warning,
          },
          payLabel: payable ? t.kaspiPayInApp : null,
          onPay: payable
              ? () => KaspiPayActions.openInKaspi(
                  context,
                  t,
                  attachment.paymentUrl,
                )
              : null,
          copyLabel: payable ? t.kaspiCopyLink : null,
          onCopy: payable
              ? () =>
                    KaspiPayActions.copyLink(context, t, attachment.paymentUrl)
              : null,
          showQrLabel: awaiting ? t.kaspiShowQr : null,
          hideQrLabel: t.kaspiHideQr,
          qrHint: t.kaspiScanHint,
        ),
        if (hasError) _errorBanner(context, ref, t, colors),
      ],
    );
  }

  /// Эффективный статус для отрисовки: живой (из опроса) приоритетнее, при его
  /// отсутствии/ошибке — статус из вставки.
  PaymentStatus _resolve(AsyncValue<PaymentStatus>? live) {
    final base = attachment.paid ? PaymentStatus.paid : PaymentStatus.pending;
    // valueOrNull, а не value: на AsyncError .value перебрасывает исключение —
    // при ошибке опроса показываем базовый статус вставки + баннер «Повторить».
    return live?.valueOrNull ?? base;
  }

  String _label(Messages t, PaymentStatus status) => switch (status) {
    PaymentStatus.paid => t.attachmentPaid,
    PaymentStatus.failed => t.paymentFailed,
    PaymentStatus.pending => t.attachmentAwaitingPayment,
  };

  Widget _errorBanner(
    BuildContext context,
    WidgetRef ref,
    Messages t,
    AppColorTokens colors,
  ) {
    return Container(
      margin: const EdgeInsets.only(top: AppSpacing.xs),
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.md,
        AppSpacing.xs,
        AppSpacing.xs,
        AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: colors.error.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(AppRadius.chip),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              t.paymentStatusError,
              style: AppTypography.bodyMedium.copyWith(color: colors.error),
            ),
          ),
          TextButton(
            onPressed: () => ref.invalidate(paymentStatusProvider(cartId!)),
            child: Text(t.retry),
          ),
        ],
      ),
    );
  }
}
