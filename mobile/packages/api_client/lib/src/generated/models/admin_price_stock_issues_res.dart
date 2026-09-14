// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_price_stock_issue.dart';

part 'admin_price_stock_issues_res.g.dart';

@JsonSerializable()
class AdminPriceStockIssuesRes {
  const AdminPriceStockIssuesRes({required this.message, required this.issues});

  factory AdminPriceStockIssuesRes.fromJson(Map<String, Object?> json) =>
      _$AdminPriceStockIssuesResFromJson(json);

  final String message;
  final List<AdminPriceStockIssue> issues;

  Map<String, Object?> toJson() => _$AdminPriceStockIssuesResToJson(this);
}
