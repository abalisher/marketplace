// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_return_shipping.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateReturnShipping _$AdminUpdateReturnShippingFromJson(
  Map<String, dynamic> json,
) => AdminUpdateReturnShipping(
  customAmount: json['custom_amount'] as num?,
  internalNote: json['internal_note'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminUpdateReturnShippingToJson(
  AdminUpdateReturnShipping instance,
) => <String, dynamic>{
  'custom_amount': instance.customAmount,
  'internal_note': instance.internalNote,
  'metadata': instance.metadata,
};
