// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_order_card_customer.g.dart';

@JsonSerializable()
class AdminOrderCardCustomer {
  const AdminOrderCardCustomer({
    required this.isCompany,
    this.name,
    this.email,
    this.phone,
    this.companyId,
    this.companyName,
    this.companyBin,
  });

  factory AdminOrderCardCustomer.fromJson(Map<String, Object?> json) =>
      _$AdminOrderCardCustomerFromJson(json);

  final String? name;
  final String? email;
  final String? phone;
  @JsonKey(name: 'is_company')
  final bool isCompany;
  @JsonKey(name: 'company_id')
  final String? companyId;
  @JsonKey(name: 'company_name')
  final String? companyName;
  @JsonKey(name: 'company_bin')
  final String? companyBin;

  Map<String, Object?> toJson() => _$AdminOrderCardCustomerToJson(this);
}
