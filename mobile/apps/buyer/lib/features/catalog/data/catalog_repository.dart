import '../domain/catalog_product.dart';
import '../domain/product_detail.dart';

/// Источник каталога для экранов покупателя. Абстракция скрывает Store API и
/// сгенерированные DTO за презентационными моделями — экраны и провайдеры
/// зависят только от этого контракта, а тесты подменяют реализацию.
abstract interface class CatalogRepository {
  /// Возвращает страницу товаров каталога (цены — в контексте региона KZ,
  /// разрешается внутри реализации).
  Future<List<CatalogProduct>> fetchProducts();

  /// Возвращает детали одного товара по [id] (цены — в контексте региона KZ).
  Future<ProductDetail> fetchProduct(String id);
}
