// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_assignee.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderAssignee _$AdminOrderAssigneeFromJson(Map<String, dynamic> json) =>
    AdminOrderAssignee(
      name: json['name'] as String,
      role: AdminOrderAssigneeRole.fromJson(json['role'] as String),
    );

Map<String, dynamic> _$AdminOrderAssigneeToJson(AdminOrderAssignee instance) =>
    <String, dynamic>{
      'name': instance.name,
      'role': _$AdminOrderAssigneeRoleEnumMap[instance.role]!,
    };

const _$AdminOrderAssigneeRoleEnumMap = {
  AdminOrderAssigneeRole.picker: 'picker',
  AdminOrderAssigneeRole.valueOperator: 'operator',
  AdminOrderAssigneeRole.$unknown: r'$unknown',
};
