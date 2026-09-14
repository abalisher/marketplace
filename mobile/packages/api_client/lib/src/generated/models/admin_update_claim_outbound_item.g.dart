// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_claim_outbound_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateClaimOutboundItem _$AdminUpdateClaimOutboundItemFromJson(
  Map<String, dynamic> json,
) => AdminUpdateClaimOutboundItem(
  quantity: json['quantity'] as num?,
  reasonId: json['reason_id'] as String?,
  internalNote: json['internal_note'] as String?,
);

Map<String, dynamic> _$AdminUpdateClaimOutboundItemToJson(
  AdminUpdateClaimOutboundItem instance,
) => <String, dynamic>{
  'quantity': ?instance.quantity,
  'reason_id': ?instance.reasonId,
  'internal_note': ?instance.internalNote,
};
