// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'customer_group_in_customer_filters.g.dart';

/// Filter by customer groups to get their associated customers.
@JsonSerializable()
class CustomerGroupInCustomerFilters {
  const CustomerGroupInCustomerFilters({
    required this.id,
    required this.name,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory CustomerGroupInCustomerFilters.fromJson(Map<String, Object?> json) =>
      _$CustomerGroupInCustomerFiltersFromJson(json);

  final dynamic id;
  final dynamic name;

  /// Filter by the group's creation date.
  @JsonKey(name: 'created_at')
  final dynamic createdAt;

  /// Filter by the group's update date.
  @JsonKey(name: 'updated_at')
  final dynamic updatedAt;

  /// Filter by the group's deletion date.
  @JsonKey(name: 'deleted_at')
  final dynamic deletedAt;

  Map<String, Object?> toJson() => _$CustomerGroupInCustomerFiltersToJson(this);
}
