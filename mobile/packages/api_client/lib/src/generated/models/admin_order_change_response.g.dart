// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_change_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderChangeResponse _$AdminOrderChangeResponseFromJson(
  Map<String, dynamic> json,
) => AdminOrderChangeResponse(
  orderChange: AdminOrderChange.fromJson(
    json['order_change'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminOrderChangeResponseToJson(
  AdminOrderChangeResponse instance,
) => <String, dynamic>{'order_change': instance.orderChange};
