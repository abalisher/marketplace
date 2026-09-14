import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_loader.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages_provider.dart';
import '../../cart/widgets/cart_icon_button.dart';
import '../providers/catalog_products_provider.dart';
import '../widgets/product_card.dart';

/// Экран каталога — первый экран пути покупателя. Показывает список товаров
/// с состояниями загрузки/ошибки/пустого результата. Данные и цены приходят
/// из бэкенда через провайдер; экран только отображает.
class CatalogScreen extends ConsumerWidget {
  const CatalogScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final messages = ref.watch(messagesProvider);
    final productsAsync = ref.watch(catalogProductsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(messages.catalogTitle),
        actions: [
          IconButton(
            tooltip: messages.estimatorTitle,
            icon: const Icon(Icons.calculate_outlined),
            onPressed: () => context.push('/estimator'),
          ),
          IconButton(
            tooltip: messages.account,
            icon: const Icon(Icons.person_outline),
            onPressed: () => context.push('/account'),
          ),
          CartIconButton(onPressed: () => context.push('/cart')),
        ],
      ),
      body: productsAsync.when(
        loading: () => const AppLoader(),
        error: (_, _) => AppErrorView(
          message: messages.catalogLoadError,
          retryLabel: messages.retry,
          onRetry: () => ref.invalidate(catalogProductsProvider),
        ),
        data: (products) {
          if (products.isEmpty) {
            return Center(
              child: Text(
                messages.catalogEmpty,
                style: AppTypography.bodyLarge,
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(AppSpacing.lg),
            itemCount: products.length,
            separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
            itemBuilder: (context, index) => ProductCard(
              product: products[index],
              priceUnavailableLabel: messages.priceUnavailable,
              onTap: () => context.push('/product/${products[index].id}'),
            ),
          );
        },
      ),
    );
  }
}
