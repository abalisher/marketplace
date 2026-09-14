// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_price_stock_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPriceStockRes _$AdminPriceStockResFromJson(Map<String, dynamic> json) =>
    AdminPriceStockRes(
      priceRows: (json['price_rows'] as List<dynamic>)
          .map((e) => AdminPriceStockRow.fromJson(e as Map<String, dynamic>))
          .toList(),
      counts: AdminPriceStockCounts.fromJson(
        json['counts'] as Map<String, dynamic>,
      ),
      categoryCounts: Map<String, num>.from(json['category_counts'] as Map),
      count: json['count'] as num,
      offset: json['offset'] as num,
      limit: json['limit'] as num,
      lowThreshold: json['low_threshold'] as num,
      scanCap: json['scan_cap'] as num,
      locations: (json['locations'] as List<dynamic>)
          .map((e) => Locations.fromJson(e as Map<String, dynamic>))
          .toList(),
      locationId: json['location_id'] as String?,
    );

Map<String, dynamic> _$AdminPriceStockResToJson(AdminPriceStockRes instance) =>
    <String, dynamic>{
      'price_rows': instance.priceRows,
      'counts': instance.counts,
      'category_counts': instance.categoryCounts,
      'count': instance.count,
      'offset': instance.offset,
      'limit': instance.limit,
      'low_threshold': instance.lowThreshold,
      'scan_cap': instance.scanCap,
      'location_id': ?instance.locationId,
      'locations': instance.locations,
    };
