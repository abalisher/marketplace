// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_add_return_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminAddReturnItem _$AdminAddReturnItemFromJson(Map<String, dynamic> json) =>
    AdminAddReturnItem(
      id: json['id'] as String,
      quantity: json['quantity'] as num,
      description: json['description'] as String?,
      internalNote: json['internal_note'] as String?,
      metadata: json['metadata'],
    );

Map<String, dynamic> _$AdminAddReturnItemToJson(AdminAddReturnItem instance) =>
    <String, dynamic>{
      'id': instance.id,
      'quantity': instance.quantity,
      'description': instance.description,
      'internal_note': instance.internalNote,
      'metadata': instance.metadata,
    };
