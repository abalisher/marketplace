// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_price_stock_change.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPriceStockChange _$AdminPriceStockChangeFromJson(
  Map<String, dynamic> json,
) => AdminPriceStockChange(
  variantId: json['variant_id'] as String,
  price: (json['price'] as num?)?.toInt(),
  stock: (json['stock'] as num?)?.toInt(),
  locationId: json['location_id'] as String?,
);

Map<String, dynamic> _$AdminPriceStockChangeToJson(
  AdminPriceStockChange instance,
) => <String, dynamic>{
  'variant_id': instance.variantId,
  'price': ?instance.price,
  'stock': ?instance.stock,
  'location_id': ?instance.locationId,
};
