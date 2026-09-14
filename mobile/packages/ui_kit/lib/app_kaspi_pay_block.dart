import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

import 'app_color_tokens.dart';
import 'app_colors.dart';
import 'app_radius.dart';
import 'app_spacing.dart';
import 'app_status_badge.dart';
import 'app_text_button.dart';
import 'app_typography.dart';

/// Платёжный блок Kaspi в ленте чата (спек 1k: сумма + действие + статус).
/// Брендинг Kaspi (красный) — только здесь. Строки/статус/действия приходят
/// параметрами (локализация и транспорт — на уровне фичи).
///
/// Порядок элементов исходит из того, что покупатель ДЕРЖИТ ЭТОТ ЭКРАН В РУКЕ:
/// сканировать свой же QR ему нечем, поэтому главное действие — кнопка
/// «оплатить» (ссылка `pay.kaspi.kz` открывает приложение Kaspi), а QR
/// свёрнут под «оплатить с другого устройства». QR и ссылка — один и тот же
/// токен, QR нужен лишь чтобы перенести счёт на соседнее устройство.
class AppKaspiPayBlock extends StatefulWidget {
  const AppKaspiPayBlock({
    required this.statusLabel,
    required this.statusColor,
    this.amount,
    this.qrData,
    this.note,
    this.payLabel,
    this.onPay,
    this.copyLabel,
    this.onCopy,
    this.showQrLabel,
    this.hideQrLabel,
    this.qrHint,
    super.key,
  });

  /// Сумма к оплате: «92 400 ₸» (опц. — если известна).
  final String? amount;

  /// Данные для QR (Kaspi qr_payload); при null раскрывашка QR не рисуется.
  final String? qrData;

  /// Метка статуса: «Ожидаем оплату» / «Оплачено».
  final String statusLabel;
  final Color statusColor;

  /// Примечание под блоком: «Счёт действителен 20 минут».
  final String? note;

  /// Главное действие — открыть счёт в приложении Kaspi. При null (оплачено,
  /// отменено) кнопка не рисуется.
  final String? payLabel;
  final VoidCallback? onPay;

  /// Передать ссылку тому, кто платит (буфер обмена). При null не рисуется.
  final String? copyLabel;
  final VoidCallback? onCopy;

  /// Подписи раскрывашки QR и подсказка под ним.
  final String? showQrLabel;
  final String? hideQrLabel;
  final String? qrHint;

  @override
  State<AppKaspiPayBlock> createState() => _AppKaspiPayBlockState();
}

class _AppKaspiPayBlockState extends State<AppKaspiPayBlock> {
  bool _qrOpen = false;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    final qrData = widget.qrData;
    final hasQr =
        qrData != null && qrData.isNotEmpty && widget.showQrLabel != null;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: colors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 28,
                height: 28,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: colors.kaspi,
                  borderRadius: BorderRadius.circular(AppRadius.chip),
                ),
                child: Text(
                  'K',
                  // Логотип Kaspi — фирменный: белая литера в любой теме.
                  style: AppTypography.titleMediumBold.copyWith(
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Text(
                'Kaspi Pay',
                style: AppTypography.titleMedium.copyWith(color: colors.ink),
              ),
              const Spacer(),
              AppStatusBadge(
                label: widget.statusLabel,
                color: widget.statusColor,
              ),
            ],
          ),
          if (widget.amount != null && widget.amount!.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.lg),
            Center(
              child: Text(
                widget.amount!,
                style: AppTypography.headingMedium.copyWith(color: colors.ink),
              ),
            ),
          ],
          if (widget.payLabel != null) ...[
            const SizedBox(height: AppSpacing.lg),
            SizedBox(
              width: double.infinity,
              // Кнопка оплаты — в фирменном красном, а не в акценте темы:
              // покупатель уходит в Kaspi и должен узнать, куда именно.
              child: ElevatedButton(
                onPressed: widget.onPay,
                style: ElevatedButton.styleFrom(
                  backgroundColor: colors.kaspi,
                  foregroundColor: Colors.white,
                ),
                child: Text(widget.payLabel!),
              ),
            ),
          ],
          if (widget.copyLabel != null)
            Center(
              child: AppTextButton(
                label: widget.copyLabel!,
                onPressed: widget.onCopy,
              ),
            ),
          if (hasQr) ...[
            Center(
              child: AppTextButton(
                label: _qrOpen
                    ? (widget.hideQrLabel ?? widget.showQrLabel!)
                    : widget.showQrLabel!,
                onPressed: () => setState(() => _qrOpen = !_qrOpen),
              ),
            ),
            if (_qrOpen) ...[
              const SizedBox(height: AppSpacing.sm),
              Center(
                // QR намеренно вне темы: тёмные модули на белом в обеих темах —
                // иначе сканеры читают его ненадёжно.
                child: QrImageView(
                  data: qrData,
                  size: 160,
                  backgroundColor: Colors.white,
                  eyeStyle: const QrEyeStyle(
                    eyeShape: QrEyeShape.square,
                    color: AppColors.ink,
                  ),
                  dataModuleStyle: const QrDataModuleStyle(
                    dataModuleShape: QrDataModuleShape.square,
                    color: AppColors.ink,
                  ),
                ),
              ),
              if (widget.qrHint != null) ...[
                const SizedBox(height: AppSpacing.xs),
                Center(
                  child: Text(
                    widget.qrHint!,
                    textAlign: TextAlign.center,
                    style: AppTypography.caption.copyWith(
                      color: colors.inkSecondary,
                    ),
                  ),
                ),
              ],
            ],
          ],
          if (widget.note != null) ...[
            const SizedBox(height: AppSpacing.xs),
            Center(
              child: Text(
                widget.note!,
                style: AppTypography.caption.copyWith(
                  color: colors.inkSecondary,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
