import 'package:api_client/api_client.dart'
    show MedusaStoreApi, StoreProduct, StoreProductVariant;

import '../../../shared/region_resolver.dart';
import '../domain/catalog_product.dart';
import '../domain/product_detail.dart';
import '../domain/product_variant_option.dart';
import 'catalog_repository.dart';

/// Реализация [CatalogRepository] поверх Medusa Store API. Запрашивает товары в
/// контексте региона KZ (резолв делегирован общему [RegionResolver]) и
/// превращает DTO в презентационные модели.
class MedusaCatalogRepository implements CatalogRepository {
  MedusaCatalogRepository(
    this._api,
    this._publishableKey,
    this._regionResolver,
  );

  final MedusaStoreApi _api;
  final String _publishableKey;
  final RegionResolver _regionResolver;

  @override
  Future<List<CatalogProduct>> fetchProducts() async {
    final regionId = await _regionResolver.resolveRegionId();
    final response = await _api.products.getProducts(
      xPublishableApiKey: _publishableKey,
      regionId: regionId,
      limit: 20,
    );
    return response.products.map(_toCatalogProduct).toList();
  }

  @override
  Future<ProductDetail> fetchProduct(String id) async {
    final regionId = await _regionResolver.resolveRegionId();
    final response = await _api.products.getProductsId(
      id: id,
      xPublishableApiKey: _publishableKey,
      regionId: regionId,
    );
    return _toProductDetail(response.product);
  }

  ProductDetail _toProductDetail(StoreProduct product) {
    final description = product.description;
    return ProductDetail(
      id: product.id,
      title: product.title,
      description: (description == null || description.isEmpty)
          ? null
          : description,
      imageUrls: _imageUrls(product),
      variants: product.variants.map(_toVariantOption).toList(),
    );
  }

  /// URL галереи: изображения товара, иначе — миниатюра, иначе — пусто.
  List<String> _imageUrls(StoreProduct product) {
    final urls = product.images
        .map((image) => image.url)
        .where((url) => url.isNotEmpty)
        .toList();
    if (urls.isNotEmpty) return urls;
    final thumbnail = product.thumbnail;
    return (thumbnail == null || thumbnail.isEmpty) ? const [] : [thumbnail];
  }

  ProductVariantOption _toVariantOption(StoreProductVariant variant) {
    final price = variant.calculatedPrice;
    return ProductVariantOption(
      id: variant.id,
      title: variant.title,
      priceAmount: price?.calculatedAmount,
      currencyCode: price?.currencyCode,
    );
  }

  CatalogProduct _toCatalogProduct(StoreProduct product) {
    final variant = product.variants.isEmpty ? null : product.variants.first;
    final price = variant?.calculatedPrice;
    final thumbnail = product.thumbnail;
    return CatalogProduct(
      id: product.id,
      title: product.title,
      thumbnailUrl: (thumbnail == null || thumbnail.isEmpty) ? null : thumbnail,
      priceAmount: price?.calculatedAmount,
      currencyCode: price?.currencyCode,
    );
  }
}
