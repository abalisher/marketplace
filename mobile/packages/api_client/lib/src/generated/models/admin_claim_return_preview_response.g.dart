// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_claim_return_preview_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminClaimReturnPreviewResponse _$AdminClaimReturnPreviewResponseFromJson(
  Map<String, dynamic> json,
) => AdminClaimReturnPreviewResponse(
  orderPreview: AdminOrderPreview.fromJson(
    json['order_preview'] as Map<String, dynamic>,
  ),
  returnValue: AdminReturn.fromJson(json['return'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminClaimReturnPreviewResponseToJson(
  AdminClaimReturnPreviewResponse instance,
) => <String, dynamic>{
  'order_preview': instance.orderPreview,
  'return': instance.returnValue,
};
