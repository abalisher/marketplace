import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

import '../l10n/messages.dart';

/// Действия со счётом Kaspi, общие для чата и чекаута: открыть в приложении и
/// передать ссылку. Живут отдельно от экранов, потому что счёт покупателю
/// показывают оба пути, а транспорт (url_launcher, буфер) у них один.
///
/// Ссылка `pay.kaspi.kz` универсальная: система сама поднимает приложение
/// Kaspi, если оно установлено, — сканировать собственный экран покупателю не
/// нужно. QR остаётся для оплаты с СОСЕДНЕГО устройства.
class KaspiPayActions {
  const KaspiPayActions._();

  /// Открыть счёт в приложении Kaspi. Не открылось (Kaspi нет на устройстве,
  /// ссылки нет) — честно говорим: ссылку и QR покупатель видит рядом.
  static Future<void> openInKaspi(
    BuildContext context,
    Messages t,
    String? paymentUrl,
  ) async {
    var opened = false;
    final uri = paymentUrl == null ? null : Uri.tryParse(paymentUrl);
    if (uri != null) {
      try {
        opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
      } on PlatformException {
        opened = false;
      }
    }
    if (!opened && context.mounted) {
      showToast(context, t.kaspiOpenFailed);
    }
  }

  /// Передать счёт тому, кто платит: на стройке заказывает прораб, а платит
  /// бухгалтер — на телефоне это и заменяет QR со стены.
  static Future<void> copyLink(
    BuildContext context,
    Messages t,
    String? paymentUrl,
  ) async {
    if (paymentUrl == null || paymentUrl.isEmpty) {
      return;
    }
    await Clipboard.setData(ClipboardData(text: paymentUrl));
    if (context.mounted) {
      showToast(context, t.kaspiLinkCopied);
    }
  }

  static void showToast(BuildContext context, String text) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(text)));
  }
}
