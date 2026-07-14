// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_customer_group.dart';

part 'admin_customer_group_response.g.dart';

/// The customer group's details.
@JsonSerializable()
class AdminCustomerGroupResponse {
  const AdminCustomerGroupResponse({required this.customerGroup});

  factory AdminCustomerGroupResponse.fromJson(Map<String, Object?> json) =>
      _$AdminCustomerGroupResponseFromJson(json);

  @JsonKey(name: 'customer_group')
  final AdminCustomerGroup customerGroup;

  Map<String, Object?> toJson() => _$AdminCustomerGroupResponseToJson(this);
}
