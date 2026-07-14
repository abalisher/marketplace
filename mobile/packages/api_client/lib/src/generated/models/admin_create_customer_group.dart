// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_customer_group.g.dart';

/// The customer group's details.
@JsonSerializable()
class AdminCreateCustomerGroup {
  const AdminCreateCustomerGroup({required this.name, this.metadata});

  factory AdminCreateCustomerGroup.fromJson(Map<String, Object?> json) =>
      _$AdminCreateCustomerGroupFromJson(json);

  /// The customer group's name.
  final String name;

  /// The customer group's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminCreateCustomerGroupToJson(this);
}
