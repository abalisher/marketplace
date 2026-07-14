// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_claim.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateClaim _$AdminCreateClaimFromJson(Map<String, dynamic> json) =>
    AdminCreateClaim(
      type: AdminCreateClaimType.fromJson(json['type'] as String),
      orderId: json['order_id'] as String,
      description: json['description'] as String?,
      internalNote: json['internal_note'] as String?,
      reasonId: json['reason_id'] as String?,
      metadata: json['metadata'],
    );

Map<String, dynamic> _$AdminCreateClaimToJson(AdminCreateClaim instance) =>
    <String, dynamic>{
      'type': _$AdminCreateClaimTypeEnumMap[instance.type]!,
      'order_id': instance.orderId,
      'description': instance.description,
      'internal_note': instance.internalNote,
      'reason_id': instance.reasonId,
      'metadata': instance.metadata,
    };

const _$AdminCreateClaimTypeEnumMap = {
  AdminCreateClaimType.refund: 'refund',
  AdminCreateClaimType.replace: 'replace',
  AdminCreateClaimType.$unknown: r'$unknown',
};
