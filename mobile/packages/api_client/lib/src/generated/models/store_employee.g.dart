// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_employee.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreEmployee _$StoreEmployeeFromJson(Map<String, dynamic> json) =>
    StoreEmployee(
      id: json['id'] as String,
      role: StoreEmployeeRole.fromJson(json['role'] as String),
      companyId: json['company_id'] as String?,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] == null
          ? null
          : DateTime.parse(json['updated_at'] as String),
    );

Map<String, dynamic> _$StoreEmployeeToJson(StoreEmployee instance) =>
    <String, dynamic>{
      'id': instance.id,
      'role': _$StoreEmployeeRoleEnumMap[instance.role]!,
      'company_id': ?instance.companyId,
      'created_at': ?instance.createdAt?.toIso8601String(),
      'updated_at': ?instance.updatedAt?.toIso8601String(),
    };

const _$StoreEmployeeRoleEnumMap = {
  StoreEmployeeRole.admin: 'admin',
  StoreEmployeeRole.member: 'member',
  StoreEmployeeRole.$unknown: r'$unknown',
};
