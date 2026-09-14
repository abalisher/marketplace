import 'product_variant_option.dart';

/// Детали товара — тонкая презентационная модель для экрана деталей. Собирается
/// из ответа Store API в репозитории; экран знает только о ней, а не о DTO.
class ProductDetail {
  const ProductDetail({
    required this.id,
    required this.title,
    required this.imageUrls,
    required this.variants,
    this.description,
  });

  /// Идентификатор товара.
  final String id;

  /// Название товара.
  final String title;

  /// URL изображений галереи (пустой список — изображений нет).
  final List<String> imageUrls;

  /// Варианты товара (может быть один «дефолтный»).
  final List<ProductVariantOption> variants;

  /// Описание товара; null — если не задано.
  final String? description;
}
