// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_price_stock_issues_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPriceStockIssuesRes _$AdminPriceStockIssuesResFromJson(
  Map<String, dynamic> json,
) => AdminPriceStockIssuesRes(
  message: json['message'] as String,
  issues: (json['issues'] as List<dynamic>)
      .map((e) => AdminPriceStockIssue.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$AdminPriceStockIssuesResToJson(
  AdminPriceStockIssuesRes instance,
) => <String, dynamic>{'message': instance.message, 'issues': instance.issues};
