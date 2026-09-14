// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_initiate_receive_return.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminInitiateReceiveReturn _$AdminInitiateReceiveReturnFromJson(
  Map<String, dynamic> json,
) => AdminInitiateReceiveReturn(
  internalNote: json['internal_note'] as String?,
  description: json['description'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminInitiateReceiveReturnToJson(
  AdminInitiateReceiveReturn instance,
) => <String, dynamic>{
  'internal_note': ?instance.internalNote,
  'description': ?instance.description,
  'metadata': ?instance.metadata,
};
