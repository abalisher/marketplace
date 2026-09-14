// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_my_document_order.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreMyDocumentOrder _$StoreMyDocumentOrderFromJson(
  Map<String, dynamic> json,
) => StoreMyDocumentOrder(
  id: json['id'] as String,
  displayId: (json['display_id'] as num?)?.toInt(),
);

Map<String, dynamic> _$StoreMyDocumentOrderToJson(
  StoreMyDocumentOrder instance,
) => <String, dynamic>{'id': instance.id, 'display_id': ?instance.displayId};
