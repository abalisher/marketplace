import 'package:flutter/material.dart';
import 'package:ui_kit/app_card.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_thumbnail.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../shared/price_label.dart';
import '../domain/catalog_product.dart';

/// Карточка товара в списке каталога: миниатюра, название и цена. Собрана из
/// примитивов `ui_kit`; текст «цена по запросу» передаётся снаружи (локаль).
class ProductCard extends StatelessWidget {
  const ProductCard({
    required this.product,
    required this.priceUnavailableLabel,
    this.onTap,
    super.key,
  });

  /// Отображаемый товар.
  final CatalogProduct product;

  /// Подпись при отсутствии цены (уже локализованная).
  final String priceUnavailableLabel;

  /// Обработчик нажатия на карточку.
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          AppThumbnail(url: product.thumbnailUrl),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.title,
                  style: AppTypography.titleMedium,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  formatPriceLabel(
                    amount: product.priceAmount,
                    currencyCode: product.currencyCode,
                    unavailableLabel: priceUnavailableLabel,
                  ),
                  style: AppTypography.bodyMedium,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
