// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_claim_order_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminClaimOrderResponse _$AdminClaimOrderResponseFromJson(
  Map<String, dynamic> json,
) => AdminClaimOrderResponse(
  order: Order.fromJson(json['order'] as String),
  claim: AdminClaim.fromJson(json['claim'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminClaimOrderResponseToJson(
  AdminClaimOrderResponse instance,
) => <String, dynamic>{
  'order': _$OrderEnumMap[instance.order]!,
  'claim': instance.claim,
};

const _$OrderEnumMap = {
  Order.createdAt: 'created_at',
  Order.minusCreatedAt: '-created_at',
  Order.updatedAt: 'updated_at',
  Order.minusUpdatedAt: '-updated_at',
  Order.$unknown: r'$unknown',
};
