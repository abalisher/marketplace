// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_return_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderReturnResponse _$AdminOrderReturnResponseFromJson(
  Map<String, dynamic> json,
) => AdminOrderReturnResponse(
  order: Order.fromJson(json['order'] as String),
  returnValue: AdminReturn.fromJson(json['return'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminOrderReturnResponseToJson(
  AdminOrderReturnResponse instance,
) => <String, dynamic>{
  'order': _$OrderEnumMap[instance.order]!,
  'return': instance.returnValue,
};

const _$OrderEnumMap = {
  Order.createdAt: 'created_at',
  Order.minusCreatedAt: '-created_at',
  Order.updatedAt: 'updated_at',
  Order.minusUpdatedAt: '-updated_at',
  Order.$unknown: r'$unknown',
};
