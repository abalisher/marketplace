// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_change.dart';

part 'admin_order_edit_response.g.dart';

/// An order edit's details.
@JsonSerializable()
class AdminOrderEditResponse {
  const AdminOrderEditResponse({required this.orderChange});

  factory AdminOrderEditResponse.fromJson(Map<String, Object?> json) =>
      _$AdminOrderEditResponseFromJson(json);

  @JsonKey(name: 'order_change')
  final AdminOrderChange orderChange;

  Map<String, Object?> toJson() => _$AdminOrderEditResponseToJson(this);
}
