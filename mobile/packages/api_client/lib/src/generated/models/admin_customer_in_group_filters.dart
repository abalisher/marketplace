// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_customer_in_group_filters.g.dart';

/// Filters to apply on customers to retrieve their groups.
@JsonSerializable()
class AdminCustomerInGroupFilters {
  const AdminCustomerInGroupFilters({
    this.id,
    this.email,
    this.defaultBillingAddressId,
    this.defaultShippingAddressId,
    this.companyName,
    this.firstName,
    this.lastName,
    this.createdBy,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
  });

  factory AdminCustomerInGroupFilters.fromJson(Map<String, Object?> json) =>
      _$AdminCustomerInGroupFiltersFromJson(json);

  final dynamic id;
  final dynamic email;
  @JsonKey(name: 'default_billing_address_id')
  final dynamic defaultBillingAddressId;
  @JsonKey(name: 'default_shipping_address_id')
  final dynamic defaultShippingAddressId;
  @JsonKey(name: 'company_name')
  final dynamic companyName;
  @JsonKey(name: 'first_name')
  final dynamic firstName;
  @JsonKey(name: 'last_name')
  final dynamic lastName;
  @JsonKey(name: 'created_by')
  final dynamic createdBy;

  /// Filter the customer's creation date.
  @JsonKey(name: 'created_at')
  final dynamic createdAt;

  /// Filter the customer's update date.
  @JsonKey(name: 'updated_at')
  final dynamic updatedAt;

  /// Filter the customer's deletion date.
  @JsonKey(name: 'deleted_at')
  final dynamic deletedAt;

  Map<String, Object?> toJson() => _$AdminCustomerInGroupFiltersToJson(this);
}
