// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_customer_group_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCustomerGroupResponse _$AdminCustomerGroupResponseFromJson(
  Map<String, dynamic> json,
) => AdminCustomerGroupResponse(
  customerGroup: AdminCustomerGroup.fromJson(
    json['customer_group'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminCustomerGroupResponseToJson(
  AdminCustomerGroupResponse instance,
) => <String, dynamic>{'customer_group': instance.customerGroup};
