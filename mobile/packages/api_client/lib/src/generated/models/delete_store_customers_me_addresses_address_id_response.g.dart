// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'delete_store_customers_me_addresses_address_id_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DeleteStoreCustomersMeAddressesAddressIdResponse
_$DeleteStoreCustomersMeAddressesAddressIdResponseFromJson(
  Map<String, dynamic> json,
) => DeleteStoreCustomersMeAddressesAddressIdResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  parent: json['parent'] == null
      ? null
      : StoreCustomer.fromJson(json['parent'] as Map<String, dynamic>),
  object: json['object'] as String? ?? 'address',
);

Map<String, dynamic> _$DeleteStoreCustomersMeAddressesAddressIdResponseToJson(
  DeleteStoreCustomersMeAddressesAddressIdResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
  'parent': instance.parent,
};
