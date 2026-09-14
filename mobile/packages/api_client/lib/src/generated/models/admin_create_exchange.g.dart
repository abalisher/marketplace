// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_exchange.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateExchange _$AdminCreateExchangeFromJson(Map<String, dynamic> json) =>
    AdminCreateExchange(
      orderId: json['order_id'] as String,
      description: json['description'] as String?,
      internalNote: json['internal_note'] as String?,
      metadata: json['metadata'],
    );

Map<String, dynamic> _$AdminCreateExchangeToJson(
  AdminCreateExchange instance,
) => <String, dynamic>{
  'order_id': instance.orderId,
  'description': ?instance.description,
  'internal_note': ?instance.internalNote,
  'metadata': ?instance.metadata,
};
