// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'items.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Items _$ItemsFromJson(Map<String, dynamic> json) => Items(
  id: json['id'] as String,
  quantity: json['quantity'] as num,
  reason: json['reason'] == null
      ? null
      : Reason.fromJson(json['reason'] as String),
  description: json['description'] as String?,
  internalNote: json['internal_note'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$ItemsToJson(Items instance) => <String, dynamic>{
  'id': instance.id,
  'quantity': instance.quantity,
  'reason': ?_$ReasonEnumMap[instance.reason],
  'description': ?instance.description,
  'internal_note': ?instance.internalNote,
  'metadata': ?instance.metadata,
};

const _$ReasonEnumMap = {
  Reason.missingItem: 'missing_item',
  Reason.wrongItem: 'wrong_item',
  Reason.productionFailure: 'production_failure',
  Reason.other: 'other',
  Reason.$unknown: r'$unknown',
};
