import 'package:core/auth/auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ui_kit/app_auth_prompt_card.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_documents_card.dart';
import 'package:ui_kit/app_image_viewer.dart';
import 'package:ui_kit/app_order_status_block.dart';
import 'package:ui_kit/app_product_card.dart';
import 'package:ui_kit/app_quantity_stepper.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../l10n/messages.dart';
import '../../../l10n/messages_provider.dart';
import '../../../shared/delivery_slot_label.dart';
import '../../../shared/order_stages.dart';
import '../../../shared/order_status_color.dart';
import '../../../shared/tenge.dart';
import '../domain/chat_attachment.dart';
import 'payment_attachment_view.dart';

/// Отрисовка read-only вставки ленты через компоненты ui_kit. Маппит доменную
/// [ChatAttachment] в нужную карточку (товар/оплата/статус); метки — из l10n
/// текущей локали (ru/kk), данные (название, цена, единица) — как отдал бэкенд.
class ChatAttachmentView extends ConsumerWidget {
  const ChatAttachmentView({
    required this.attachment,
    this.cartId,
    this.orderId,
    this.quantities = const {},
    this.onQuantityChange,
    super.key,
  });

  final ChatAttachment attachment;

  /// Токен корзины текущего диалога — нужен платёжной вставке для авто-поллинга
  /// статуса оплаты (экран 1c).
  final String? cartId;

  /// Токен заказа текущего диалога — по нему вставка «статус заказа» открывает
  /// экран заказа (документы, состав). Гостю экран недоступен (маршрут
  /// `/orders/:id` защищён), поэтому ссылка показывается только вошедшему.
  final String? orderId;

  /// Сколько каждой позиции сейчас в корзине: variant_id → количество (T10.15).
  final Map<String, int> quantities;

  /// Счётчик «−/+» изменил количество позиции. Если null — карточка read-only
  /// (например, в голденах).
  final void Function({
    required String variantId,
    required String title,
    required int quantity,
  })?
  onQuantityChange;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = ref.watch(messagesProvider);
    final colors = AppColorTokens.of(context);
    final a = attachment;
    switch (a) {
      case ProductCardAttachment():
        final imageUrl = a.imageUrl;
        final hasPhoto = imageUrl != null && imageUrl.isNotEmpty;
        final quantity = quantities[a.variantId] ?? 0;
        final onChange = onQuantityChange;
        return AppProductCard(
          title: a.title,
          price: formatTenge(a.price),
          unit: a.unit == null ? null : t.attachmentPerUnit(a.unit!),
          imageUrl: a.imageUrl,
          stockLabel: a.inStock ? t.attachmentInStock : t.attachmentOnOrder,
          stockColor: a.inStock ? colors.success : colors.warning,
          // Карточка больше не «выбор» репликой: справа счётчик, который пишет
          // прямо в корзину (T10.15, решение владельца 2026-08-31).
          highlighted: quantity > 0,
          trailing: onChange == null
              ? null
              : AppQuantityStepper(
                  value: quantity,
                  addLabel: t.cartAdd,
                  increaseLabel: t.cartIncrease(a.title),
                  decreaseLabel: t.cartDecrease(a.title),
                  quantityLabel: t.cartQuantity(a.title),
                  onChanged: (next) => onChange(
                    variantId: a.variantId,
                    title: a.title,
                    quantity: next,
                  ),
                ),
          // Тап по фото — просмотр изображения (правка владельца 2026-08-04).
          imageTapLabel: hasPhoto ? t.attachmentPhotoOpen : null,
          onImageTap: hasPhoto
              ? () => AppImageViewer.show(
                  context,
                  imageUrl: imageUrl,
                  title: a.title,
                  closeLabel: t.commonClose,
                )
              : null,
        );
      case PaymentAttachment():
        // Платёжная вставка — живая (авто-поллинг статуса), отдельный виджет.
        return PaymentAttachmentView(attachment: a, cartId: cartId);
      case OrderStatusAttachment():
        // Ссылка на заказ — только вошедшему покупателю: экран заказа живёт в
        // защищённой части приложения, гостя роутер увёл бы на вход.
        final authed = ref.watch(authControllerProvider).valueOrNull != null;
        final id = orderId;
        final canOpen = authed && id != null && id.isNotEmpty;
        return AppOrderStatusBlock(
          orderNumber: a.displayId != null
              ? t.attachmentOrderTitle(a.displayId!)
              : t.attachmentOrderFallbackTitle,
          statusLabel: a.statusText ?? t.attachmentOrderProcessing,
          // Стадия и цвет бейджа — из КОДА жизненного цикла (`deliveryStage`),
          // прогресс курьера приходит отдельным полем (T3.11).
          statusColor: orderStatusColor(a.deliveryStage, colors),
          stages: orderStages(a.deliveryStage, t),
          courierNote: a.courierNote,
          // Слот доставки в самой вставке (T5.6a): до этого окно приезда жило
          // только в тексте ассистента, и карточка статуса шла без срока.
          slotTitle: t.deliverySlotTitle,
          slotLabel: formatDeliverySlotLabel(
            a.deliveryDate,
            a.deliveryWindow,
            t,
          ),
          receiptCode: a.deliveryCode,
          codeLabel: a.deliveryCode != null ? t.deliveryCodeTitle : null,
          openLabel: canOpen ? t.attachmentOrderOpen : null,
          onOpen: canOpen ? () => context.push('/cabinet/orders/$id') : null,
        );
      case OrderDocumentsAttachment():
        return AppDocumentsCard(
          title: a.displayId != null
              ? t.attachmentDocumentsTitle(a.displayId!)
              : t.attachmentDocumentsFallbackTitle,
          openLabel: t.attachmentDocumentOpen,
          pendingLabel: t.attachmentDocumentPending,
          documents: [
            for (final document in a.documents)
              AppDocumentEntry(
                title: document.title,
                number: document.number,
                onOpen: document.url == null
                    ? null
                    : () => _openDocument(context, t, document.url!),
              ),
          ],
        );
      case AuthPromptAttachment():
        // Вставка живёт в ленте и после входа: тогда показывать кнопку незачем —
        // покупатель уже вошёл, и карточка читалась бы как «войдите ещё раз».
        final loggedIn = ref.watch(authControllerProvider).valueOrNull != null;
        if (loggedIn) return const SizedBox.shrink();
        return AppAuthPromptCard(
          title: t.attachmentAuthPromptTitle,
          description: t.attachmentAuthPromptDescription,
          actionLabel: t.attachmentAuthPromptAction,
          // Возвращаемся ровно в чат: диалог и корзина остаются на месте,
          // корзина гостя переезжает на покупателя следующим ходом.
          onAction: () => context.push('/login?redirect=/chat'),
        );
      case UnknownAttachment():
        return const SizedBox.shrink();
    }
  }

  /// Открыть PDF документа во внешнем приложении. Идиома экрана заказа:
  /// запускаем только http(s)-ссылку (File Module отдаёт такие), сбой запуска не
  /// роняет ленту — показываем снекбар.
  Future<void> _openDocument(
    BuildContext context,
    Messages t,
    String rawUrl,
  ) async {
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
