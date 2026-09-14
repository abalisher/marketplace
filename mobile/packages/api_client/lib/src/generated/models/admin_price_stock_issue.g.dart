// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_price_stock_issue.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPriceStockIssue _$AdminPriceStockIssueFromJson(
  Map<String, dynamic> json,
) => AdminPriceStockIssue(
  variantId: json['variant_id'] as String,
  code: AdminPriceStockIssueCode.fromJson(json['code'] as String),
  title: json['title'] as String?,
);

Map<String, dynamic> _$AdminPriceStockIssueToJson(
  AdminPriceStockIssue instance,
) => <String, dynamic>{
  'variant_id': instance.variantId,
  'code': _$AdminPriceStockIssueCodeEnumMap[instance.code]!,
  'title': ?instance.title,
};

const _$AdminPriceStockIssueCodeEnumMap = {
  AdminPriceStockIssueCode.unknownVariant: 'unknown_variant',
  AdminPriceStockIssueCode.emptyChange: 'empty_change',
  AdminPriceStockIssueCode.priceRules: 'price_rules',
  AdminPriceStockIssueCode.stockNotManaged: 'stock_not_managed',
  AdminPriceStockIssueCode.locationRequired: 'location_required',
  AdminPriceStockIssueCode.unknownLocation: 'unknown_location',
  AdminPriceStockIssueCode.duplicateChange: 'duplicate_change',
  AdminPriceStockIssueCode.$unknown: r'$unknown',
};
