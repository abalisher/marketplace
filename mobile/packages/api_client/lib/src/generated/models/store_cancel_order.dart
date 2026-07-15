// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_cancel_order.g.dart';

@JsonSerializable()
class StoreCancelOrder {
  const StoreCancelOrder({this.reason});

  factory StoreCancelOrder.fromJson(Map<String, Object?> json) =>
      _$StoreCancelOrderFromJson(json);

  /// Причина отмены (опционально; логируется в истории).
  final String? reason;

  Map<String, Object?> toJson() => _$StoreCancelOrderToJson(this);
}
