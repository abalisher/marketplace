// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_create_employee.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCreateEmployee _$StoreCreateEmployeeFromJson(Map<String, dynamic> json) =>
    StoreCreateEmployee(
      customerId: json['customer_id'] as String,
      role: json['role'] == null
          ? null
          : StoreCreateEmployeeRole.fromJson(json['role'] as String),
    );

Map<String, dynamic> _$StoreCreateEmployeeToJson(
  StoreCreateEmployee instance,
) => <String, dynamic>{
  'customer_id': instance.customerId,
  'role': ?_$StoreCreateEmployeeRoleEnumMap[instance.role],
};

const _$StoreCreateEmployeeRoleEnumMap = {
  StoreCreateEmployeeRole.admin: 'admin',
  StoreCreateEmployeeRole.member: 'member',
  StoreCreateEmployeeRole.$unknown: r'$unknown',
};
