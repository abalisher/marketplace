import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/product_detail.dart';
import 'catalog_repository_provider.dart';

/// Детали товара по его id с состояниями загрузки/ошибки. Экран читает через
/// `.when(...)`; повтор — `ref.invalidate(productDetailProvider(id))`.
final productDetailProvider = FutureProvider.family<ProductDetail, String>((
  ref,
  productId,
) async {
  final repository = ref.watch(catalogRepositoryProvider);
  return repository.fetchProduct(productId);
});
