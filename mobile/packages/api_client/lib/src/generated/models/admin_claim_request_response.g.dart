// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_claim_request_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminClaimRequestResponse _$AdminClaimRequestResponseFromJson(
  Map<String, dynamic> json,
) => AdminClaimRequestResponse(
  returnValue: AdminReturn.fromJson(json['return'] as Map<String, dynamic>),
  orderPreview: AdminOrderPreview.fromJson(
    json['order_preview'] as Map<String, dynamic>,
  ),
  claim: AdminClaim.fromJson(json['claim'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminClaimRequestResponseToJson(
  AdminClaimRequestResponse instance,
) => <String, dynamic>{
  'return': instance.returnValue,
  'order_preview': instance.orderPreview,
  'claim': instance.claim,
};
