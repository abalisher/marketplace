// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_cancel_order.g.dart';

@JsonSerializable()
class AdminCancelOrder {
  const AdminCancelOrder({this.reason});

  factory AdminCancelOrder.fromJson(Map<String, Object?> json) =>
      _$AdminCancelOrderFromJson(json);

  /// Причина отмены (опционально; логируется).
  final String? reason;

  Map<String, Object?> toJson() => _$AdminCancelOrderToJson(this);
}
