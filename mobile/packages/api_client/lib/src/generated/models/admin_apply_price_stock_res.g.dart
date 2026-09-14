// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_apply_price_stock_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminApplyPriceStockRes _$AdminApplyPriceStockResFromJson(
  Map<String, dynamic> json,
) => AdminApplyPriceStockRes(
  applied: json['applied'] as num,
  skipped: json['skipped'] as num,
  priceRows: (json['price_rows'] as List<dynamic>)
      .map((e) => AdminPriceStockRow.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$AdminApplyPriceStockResToJson(
  AdminApplyPriceStockRes instance,
) => <String, dynamic>{
  'applied': instance.applied,
  'skipped': instance.skipped,
  'price_rows': instance.priceRows,
};
