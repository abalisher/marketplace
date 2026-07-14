// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_change.dart';

part 'admin_order_change_response.g.dart';

/// The details of the order change.
@JsonSerializable()
class AdminOrderChangeResponse {
  const AdminOrderChangeResponse({required this.orderChange});

  factory AdminOrderChangeResponse.fromJson(Map<String, Object?> json) =>
      _$AdminOrderChangeResponseFromJson(json);

  @JsonKey(name: 'order_change')
  final AdminOrderChange orderChange;

  Map<String, Object?> toJson() => _$AdminOrderChangeResponseToJson(this);
}
