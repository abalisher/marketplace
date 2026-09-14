// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_product_variants_sealed.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Map<String, dynamic> _$AdminUpdateProductVariantsSealedToJson(
  AdminUpdateProductVariantsSealed instance,
) => <String, dynamic>{};

AdminUpdateProductVariantsSealedAdminCreateProductVariant
_$AdminUpdateProductVariantsSealedAdminCreateProductVariantFromJson(
  Map<String, dynamic> json,
) => AdminUpdateProductVariantsSealedAdminCreateProductVariant(
  title: json['title'] as String,
  sku: json['sku'] as String?,
  ean: json['ean'] as String?,
  upc: json['upc'] as String?,
  barcode: json['barcode'] as String?,
  hsCode: json['hsCode'] as String?,
  midCode: json['midCode'] as String?,
  allowBackorder: json['allowBackorder'] as bool?,
  manageInventory: json['manageInventory'] as bool?,
  variantRank: json['variantRank'] as num?,
  weight: json['weight'] as num?,
  length: json['length'] as num?,
  height: json['height'] as num?,
  width: json['width'] as num?,
  originCountry: json['originCountry'] as String?,
  material: json['material'] as String?,
  metadata: json['metadata'],
  prices: (json['prices'] as List<dynamic>)
      .map(
        (e) =>
            AdminCreateProductVariantPrice.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  options: json['options'],
  inventoryItems: (json['inventoryItems'] as List<dynamic>?)
      ?.map(
        (e) => AdminCreateProductVariantInventoryKit.fromJson(
          e as Map<String, dynamic>,
        ),
      )
      .toList(),
);

Map<String, dynamic>
_$AdminUpdateProductVariantsSealedAdminCreateProductVariantToJson(
  AdminUpdateProductVariantsSealedAdminCreateProductVariant instance,
) => <String, dynamic>{
  'title': instance.title,
  'sku': ?instance.sku,
  'ean': ?instance.ean,
  'upc': ?instance.upc,
  'barcode': ?instance.barcode,
  'hsCode': ?instance.hsCode,
  'midCode': ?instance.midCode,
  'allowBackorder': ?instance.allowBackorder,
  'manageInventory': ?instance.manageInventory,
  'variantRank': ?instance.variantRank,
  'weight': ?instance.weight,
  'length': ?instance.length,
  'height': ?instance.height,
  'width': ?instance.width,
  'originCountry': ?instance.originCountry,
  'material': ?instance.material,
  'metadata': ?instance.metadata,
  'prices': instance.prices,
  'options': ?instance.options,
  'inventoryItems': ?instance.inventoryItems,
};

AdminUpdateProductVariantsSealedAdminUpdateProductVariant
_$AdminUpdateProductVariantsSealedAdminUpdateProductVariantFromJson(
  Map<String, dynamic> json,
) => AdminUpdateProductVariantsSealedAdminUpdateProductVariant(
  title: json['title'] as String?,
  sku: json['sku'] as String?,
  ean: json['ean'] as String?,
  upc: json['upc'] as String?,
  barcode: json['barcode'] as String?,
  hsCode: json['hsCode'] as String?,
  midCode: json['midCode'] as String?,
  allowBackorder: json['allowBackorder'] as bool?,
  manageInventory: json['manageInventory'] as bool?,
  variantRank: json['variantRank'] as num?,
  weight: json['weight'] as num?,
  length: json['length'] as num?,
  height: json['height'] as num?,
  width: json['width'] as num?,
  originCountry: json['originCountry'] as String?,
  material: json['material'] as String?,
  metadata: json['metadata'],
  prices: (json['prices'] as List<dynamic>?)
      ?.map(
        (e) =>
            AdminCreateProductVariantPrice.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  options: json['options'],
);

Map<String, dynamic>
_$AdminUpdateProductVariantsSealedAdminUpdateProductVariantToJson(
  AdminUpdateProductVariantsSealedAdminUpdateProductVariant instance,
) => <String, dynamic>{
  'title': ?instance.title,
  'sku': ?instance.sku,
  'ean': ?instance.ean,
  'upc': ?instance.upc,
  'barcode': ?instance.barcode,
  'hsCode': ?instance.hsCode,
  'midCode': ?instance.midCode,
  'allowBackorder': ?instance.allowBackorder,
  'manageInventory': ?instance.manageInventory,
  'variantRank': ?instance.variantRank,
  'weight': ?instance.weight,
  'length': ?instance.length,
  'height': ?instance.height,
  'width': ?instance.width,
  'originCountry': ?instance.originCountry,
  'material': ?instance.material,
  'metadata': ?instance.metadata,
  'prices': ?instance.prices,
  'options': ?instance.options,
};
