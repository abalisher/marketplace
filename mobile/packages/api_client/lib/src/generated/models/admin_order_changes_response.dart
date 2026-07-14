// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_change.dart';

part 'admin_order_changes_response.g.dart';

/// The details of an order's changes.
@JsonSerializable()
class AdminOrderChangesResponse {
  const AdminOrderChangesResponse({required this.orderChanges});

  factory AdminOrderChangesResponse.fromJson(Map<String, Object?> json) =>
      _$AdminOrderChangesResponseFromJson(json);

  /// An order's changes.
  @JsonKey(name: 'order_changes')
  final List<AdminOrderChange> orderChanges;

  Map<String, Object?> toJson() => _$AdminOrderChangesResponseToJson(this);
}
