// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_company_employee.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCompanyEmployee _$StoreCompanyEmployeeFromJson(
  Map<String, dynamic> json,
) => StoreCompanyEmployee(
  id: json['id'] as String,
  role: StoreCompanyEmployeeRole.fromJson(json['role'] as String),
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
  customer: json['customer'] == null
      ? null
      : StoreEmployeeCustomer.fromJson(
          json['customer'] as Map<String, dynamic>,
        ),
  spendLimits: (json['spend_limits'] as List<dynamic>?)
      ?.map((e) => StoreSpendLimit.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$StoreCompanyEmployeeToJson(
  StoreCompanyEmployee instance,
) => <String, dynamic>{
  'id': instance.id,
  'role': _$StoreCompanyEmployeeRoleEnumMap[instance.role]!,
  'created_at': ?instance.createdAt?.toIso8601String(),
  'customer': ?instance.customer,
  'spend_limits': ?instance.spendLimits,
};

const _$StoreCompanyEmployeeRoleEnumMap = {
  StoreCompanyEmployeeRole.admin: 'admin',
  StoreCompanyEmployeeRole.member: 'member',
  StoreCompanyEmployeeRole.$unknown: r'$unknown',
};
