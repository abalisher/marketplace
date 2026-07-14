// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_customer_group.g.dart';

/// The details to update in a customer group.
@JsonSerializable()
class AdminUpdateCustomerGroup {
  const AdminUpdateCustomerGroup({this.name, this.metadata});

  factory AdminUpdateCustomerGroup.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateCustomerGroupFromJson(json);

  /// The customer group's name.
  final String? name;

  /// The customer group's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminUpdateCustomerGroupToJson(this);
}
