// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_price_stock_issue_code.dart';

part 'admin_price_stock_issue.g.dart';

@JsonSerializable()
class AdminPriceStockIssue {
  const AdminPriceStockIssue({
    required this.variantId,
    required this.code,
    this.title,
  });

  factory AdminPriceStockIssue.fromJson(Map<String, Object?> json) =>
      _$AdminPriceStockIssueFromJson(json);

  @JsonKey(name: 'variant_id')
  final String variantId;
  final AdminPriceStockIssueCode code;

  /// Название позиции — в массовой правке иначе непонятно, какая помешала.
  final String? title;

  Map<String, Object?> toJson() => _$AdminPriceStockIssueToJson(this);
}
