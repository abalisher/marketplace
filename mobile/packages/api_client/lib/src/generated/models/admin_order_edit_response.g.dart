// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_edit_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderEditResponse _$AdminOrderEditResponseFromJson(
  Map<String, dynamic> json,
) => AdminOrderEditResponse(
  orderChange: AdminOrderChange.fromJson(
    json['order_change'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminOrderEditResponseToJson(
  AdminOrderEditResponse instance,
) => <String, dynamic>{'order_change': instance.orderChange};
