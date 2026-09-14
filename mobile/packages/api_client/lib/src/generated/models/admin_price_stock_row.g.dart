// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_price_stock_row.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPriceStockRow _$AdminPriceStockRowFromJson(Map<String, dynamic> json) =>
    AdminPriceStockRow(
      variantId: json['variant_id'] as String,
      productId: json['product_id'] as String,
      title: json['title'] as String,
      currencyCode: json['currency_code'] as String,
      stocked: json['stocked'] as num,
      reserved: json['reserved'] as num,
      available: json['available'] as num,
      stockedTotal: json['stocked_total'] as num,
      locationsCount: json['locations_count'] as num,
      stockEditable: json['stock_editable'] as bool,
      priceEditable: json['price_editable'] as bool,
      variantTitle: json['variant_title'] as String?,
      sku: json['sku'] as String?,
      unit: json['unit'] as String?,
      status: json['status'] as String?,
      categoryHandle: json['category_handle'] as String?,
      categoryName: json['category_name'] as String?,
      price: json['price'] as num?,
      locationId: json['location_id'] as String?,
      locationName: json['location_name'] as String?,
    );

Map<String, dynamic> _$AdminPriceStockRowToJson(AdminPriceStockRow instance) =>
    <String, dynamic>{
      'variant_id': instance.variantId,
      'product_id': instance.productId,
      'title': instance.title,
      'variant_title': ?instance.variantTitle,
      'sku': ?instance.sku,
      'unit': ?instance.unit,
      'status': ?instance.status,
      'category_handle': ?instance.categoryHandle,
      'category_name': ?instance.categoryName,
      'price': ?instance.price,
      'currency_code': instance.currencyCode,
      'stocked': instance.stocked,
      'reserved': instance.reserved,
      'available': instance.available,
      'stocked_total': instance.stockedTotal,
      'location_id': ?instance.locationId,
      'location_name': ?instance.locationName,
      'locations_count': instance.locationsCount,
      'stock_editable': instance.stockEditable,
      'price_editable': instance.priceEditable,
    };
