// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_delete_payment_collection_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminDeletePaymentCollectionResponse
_$AdminDeletePaymentCollectionResponseFromJson(Map<String, dynamic> json) =>
    AdminDeletePaymentCollectionResponse(
      id: json['id'] as String,
      deleted: json['deleted'] as bool,
      object: json['object'] as String? ?? 'payment-collection',
    );

Map<String, dynamic> _$AdminDeletePaymentCollectionResponseToJson(
  AdminDeletePaymentCollectionResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
};
