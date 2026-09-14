import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ui_kit/app_choice_chip.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_image_gallery.dart';
import 'package:ui_kit/app_loader.dart';
import 'package:ui_kit/app_primary_button.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages.dart';
import '../../../l10n/messages_provider.dart';
import '../../../shared/price_label.dart';
import '../../cart/providers/cart_controller.dart';
import '../../cart/widgets/cart_icon_button.dart';
import '../domain/product_detail.dart';
import '../domain/product_variant_option.dart';
import '../providers/product_detail_provider.dart';

/// Экран деталей товара: галерея, название, цена выбранного варианта, описание,
/// выбор варианта и кнопка «В корзину» (добавляет вариант через контроллер
/// корзины). Данные и цены приходят из бэкенда через провайдер; экран отображает
/// и делегирует действия.
class ProductDetailScreen extends ConsumerStatefulWidget {
  const ProductDetailScreen({required this.productId, super.key});

  /// Идентификатор открываемого товара.
  final String productId;

  @override
  ConsumerState<ProductDetailScreen> createState() =>
      _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  /// Выбранный вариант (id); null — берётся первый вариант товара.
  String? _selectedVariantId;

  @override
  Widget build(BuildContext context) {
    final messages = ref.watch(messagesProvider);
    final detailAsync = ref.watch(productDetailProvider(widget.productId));

    return Scaffold(
      appBar: AppBar(
        title: Text(messages.productTitle),
        actions: [CartIconButton(onPressed: () => context.push('/cart'))],
      ),
      body: detailAsync.when(
        loading: () => const AppLoader(),
        error: (_, _) => AppErrorView(
          message: messages.productLoadError,
          retryLabel: messages.retry,
          onRetry: () =>
              ref.invalidate(productDetailProvider(widget.productId)),
        ),
        data: (product) {
          final selected = _selectedVariant(product.variants);
          return _DetailBody(
            product: product,
            messages: messages,
            selectedVariant: selected,
            onVariantSelected: (id) => setState(() => _selectedVariantId = id),
            onAddToCart: selected == null
                ? null
                : () => _addToCart(messages, selected.id),
          );
        },
      ),
    );
  }

  /// Выбранный вариант из списка: по сохранённому id либо первый по умолчанию.
  ProductVariantOption? _selectedVariant(List<ProductVariantOption> variants) {
    if (variants.isEmpty) return null;
    return variants.firstWhere(
      (variant) => variant.id == _selectedVariantId,
      orElse: () => variants.first,
    );
  }

  /// Добавляет выбранный вариант в корзину и показывает результат SnackBar'ом.
  /// Итоги/наличие считает бэкенд; экран лишь зовёт контроллер.
  Future<void> _addToCart(Messages messages, String variantId) async {
    final messenger = ScaffoldMessenger.of(context);
    try {
      await ref.read(cartControllerProvider.notifier).addVariant(variantId);
      messenger
        ..hideCurrentSnackBar()
        ..showSnackBar(SnackBar(content: Text(messages.addedToCart)));
    } catch (_) {
      messenger
        ..hideCurrentSnackBar()
        ..showSnackBar(SnackBar(content: Text(messages.cartUpdateError)));
    }
  }
}

/// Прокручиваемое содержимое экрана деталей.
class _DetailBody extends StatelessWidget {
  const _DetailBody({
    required this.product,
    required this.messages,
    required this.selectedVariant,
    required this.onVariantSelected,
    required this.onAddToCart,
  });

  final ProductDetail product;
  final Messages messages;
  final ProductVariantOption? selectedVariant;
  final ValueChanged<String> onVariantSelected;

  /// Добавление в корзину; null — вариант недоступен, кнопка неактивна.
  final VoidCallback? onAddToCart;

  @override
  Widget build(BuildContext context) {
    final description = product.description;
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        AppImageGallery(imageUrls: product.imageUrls),
        const SizedBox(height: AppSpacing.lg),
        Text(product.title, style: AppTypography.headingMedium),
        const SizedBox(height: AppSpacing.sm),
        Text(
          formatPriceLabel(
            amount: selectedVariant?.priceAmount,
            currencyCode: selectedVariant?.currencyCode,
            unavailableLabel: messages.priceUnavailable,
          ),
          style: AppTypography.headingLarge,
        ),
        if (product.variants.length > 1) ...[
          const SizedBox(height: AppSpacing.lg),
          Text(messages.variantsTitle, style: AppTypography.titleMedium),
          const SizedBox(height: AppSpacing.sm),
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: [
              for (final variant in product.variants)
                AppChoiceChip(
                  label: variant.title,
                  selected: variant.id == selectedVariant?.id,
                  onTap: () => onVariantSelected(variant.id),
                ),
            ],
          ),
        ],
        if (description != null) ...[
          const SizedBox(height: AppSpacing.lg),
          Text(messages.descriptionTitle, style: AppTypography.titleMedium),
          const SizedBox(height: AppSpacing.sm),
          Text(description, style: AppTypography.bodyLarge),
        ],
        const SizedBox(height: AppSpacing.xl),
        AppPrimaryButton(
          label: messages.addToCart,
          icon: Icons.add_shopping_cart_outlined,
          onPressed: onAddToCart,
        ),
      ],
    );
  }
}
