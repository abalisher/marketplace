// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'base_product_variant.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BaseProductVariant _$BaseProductVariantFromJson(Map<String, dynamic> json) =>
    BaseProductVariant(
      id: json['id'] as String,
      title: json['title'] as String,
      sku: json['sku'] as String,
      barcode: json['barcode'] as String,
      ean: json['ean'] as String,
      upc: json['upc'] as String,
      allowBackorder: json['allow_backorder'] as bool,
      manageInventory: json['manage_inventory'] as bool,
      hsCode: json['hs_code'] as String,
      originCountry: json['origin_country'] as String,
      midCode: json['mid_code'] as String,
      material: json['material'] as String,
      weight: json['weight'] as num,
      length: json['length'] as num,
      height: json['height'] as num,
      width: json['width'] as num,
      options: (json['options'] as List<dynamic>)
          .map(
            (e) => BaseProductOptionValue.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      deletedAt: DateTime.parse(json['deleted_at'] as String),
      thumbnail: json['thumbnail'] as String,
      inventoryQuantity: json['inventory_quantity'] as num?,
      variantRank: json['variant_rank'] as num?,
      product: json['product'] == null
          ? null
          : BaseProduct.fromJson(json['product'] as Map<String, dynamic>),
      productId: json['product_id'] as String?,
      calculatedPrice: json['calculated_price'] == null
          ? null
          : BaseCalculatedPriceSet.fromJson(
              json['calculated_price'] as Map<String, dynamic>,
            ),
      metadata: json['metadata'],
      images: (json['images'] as List<dynamic>?)
          ?.map((e) => BaseProductImage.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$BaseProductVariantToJson(BaseProductVariant instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'sku': instance.sku,
      'barcode': instance.barcode,
      'ean': instance.ean,
      'upc': instance.upc,
      'allow_backorder': instance.allowBackorder,
      'manage_inventory': instance.manageInventory,
      'inventory_quantity': instance.inventoryQuantity,
      'hs_code': instance.hsCode,
      'origin_country': instance.originCountry,
      'mid_code': instance.midCode,
      'material': instance.material,
      'weight': instance.weight,
      'length': instance.length,
      'height': instance.height,
      'width': instance.width,
      'variant_rank': instance.variantRank,
      'options': instance.options,
      'product': instance.product,
      'product_id': instance.productId,
      'calculated_price': instance.calculatedPrice,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'deleted_at': instance.deletedAt.toIso8601String(),
      'metadata': instance.metadata,
      'thumbnail': instance.thumbnail,
      'images': instance.images,
    };
