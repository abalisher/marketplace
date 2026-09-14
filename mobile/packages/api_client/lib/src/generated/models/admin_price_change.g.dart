// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_price_change.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPriceChange _$AdminPriceChangeFromJson(Map<String, dynamic> json) =>
    AdminPriceChange(
      id: json['id'] as String,
      variantId: json['variant_id'] as String,
      productTitle: json['product_title'] as String,
      source: AdminPriceChangeSource.fromJson(json['source'] as String),
      createdAt: DateTime.parse(json['created_at'] as String),
      variantTitle: json['variant_title'] as String?,
      sku: json['sku'] as String?,
      currencyCode: json['currency_code'] as String?,
      oldPrice: json['old_price'] as num?,
      newPrice: json['new_price'] as num?,
      oldStock: json['old_stock'] as num?,
      newStock: json['new_stock'] as num?,
      locationId: json['location_id'] as String?,
      locationName: json['location_name'] as String?,
      changedByName: json['changed_by_name'] as String?,
    );

Map<String, dynamic> _$AdminPriceChangeToJson(AdminPriceChange instance) =>
    <String, dynamic>{
      'id': instance.id,
      'variant_id': instance.variantId,
      'product_title': instance.productTitle,
      'variant_title': ?instance.variantTitle,
      'sku': ?instance.sku,
      'currency_code': ?instance.currencyCode,
      'old_price': ?instance.oldPrice,
      'new_price': ?instance.newPrice,
      'old_stock': ?instance.oldStock,
      'new_stock': ?instance.newStock,
      'location_id': ?instance.locationId,
      'location_name': ?instance.locationName,
      'changed_by_name': ?instance.changedByName,
      'source': _$AdminPriceChangeSourceEnumMap[instance.source]!,
      'created_at': instance.createdAt.toIso8601String(),
    };

const _$AdminPriceChangeSourceEnumMap = {
  AdminPriceChangeSource.manual: 'manual',
  AdminPriceChangeSource.valueImport: 'import',
  AdminPriceChangeSource.$unknown: r'$unknown',
};
