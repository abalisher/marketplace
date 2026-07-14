// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_claim_order_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminClaimOrderResponse _$AdminClaimOrderResponseFromJson(
  Map<String, dynamic> json,
) => AdminClaimOrderResponse(
  order: Order.fromJson(json['order'] as Map<String, dynamic>),
  claim: AdminClaim.fromJson(json['claim'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminClaimOrderResponseToJson(
  AdminClaimOrderResponse instance,
) => <String, dynamic>{'order': instance.order, 'claim': instance.claim};
