// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_customer_group.g.dart';

/// The customer group's details.
@JsonSerializable()
class AdminCustomerGroup {
  const AdminCustomerGroup({
    required this.id,
    required this.name,
    required this.customers,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
  });

  factory AdminCustomerGroup.fromJson(Map<String, Object?> json) =>
      _$AdminCustomerGroupFromJson(json);

  /// The customer group's ID.
  final String id;

  /// The customer group's name.
  final String name;

  /// The customer group's customers.
  final List<dynamic> customers;

  /// The customer group's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  /// The customer group's creation date.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The customer group's update date.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  Map<String, Object?> toJson() => _$AdminCustomerGroupToJson(this);
}
