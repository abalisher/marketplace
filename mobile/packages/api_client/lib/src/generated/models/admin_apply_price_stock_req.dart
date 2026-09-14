// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_apply_price_stock_req_source.dart';
import 'admin_price_stock_change.dart';

part 'admin_apply_price_stock_req.g.dart';

@JsonSerializable()
class AdminApplyPriceStockReq {
  const AdminApplyPriceStockReq({
    required this.changes,
    this.source = AdminApplyPriceStockReqSource.manual,
  });

  factory AdminApplyPriceStockReq.fromJson(Map<String, Object?> json) =>
      _$AdminApplyPriceStockReqFromJson(json);

  final List<AdminPriceStockChange> changes;

  /// Чем правили: руками в строке или загрузкой файла — видно в журнале.
  final AdminApplyPriceStockReqSource source;

  Map<String, Object?> toJson() => _$AdminApplyPriceStockReqToJson(this);
}
