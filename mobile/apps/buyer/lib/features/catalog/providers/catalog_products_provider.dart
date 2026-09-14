import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/catalog_product.dart';
import 'catalog_repository_provider.dart';

/// Список товаров каталога с состояниями загрузки/ошибки. Экран читает его
/// через `.when(...)`; повтор — `ref.invalidate(catalogProductsProvider)`.
final catalogProductsProvider = FutureProvider<List<CatalogProduct>>((
  ref,
) async {
  final repository = ref.watch(catalogRepositoryProvider);
  return repository.fetchProducts();
});
