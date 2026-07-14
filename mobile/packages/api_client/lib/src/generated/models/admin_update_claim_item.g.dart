// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_claim_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateClaimItem _$AdminUpdateClaimItemFromJson(
  Map<String, dynamic> json,
) => AdminUpdateClaimItem(
  quantity: json['quantity'] as num?,
  reasonId: json['reason_id'] as String?,
  internalNote: json['internal_note'] as String?,
);

Map<String, dynamic> _$AdminUpdateClaimItemToJson(
  AdminUpdateClaimItem instance,
) => <String, dynamic>{
  'quantity': instance.quantity,
  'reason_id': instance.reasonId,
  'internal_note': instance.internalNote,
};
