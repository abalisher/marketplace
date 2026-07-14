// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_customer.dart';

part 'delete_store_customers_me_addresses_address_id_response.g.dart';

/// The deletion's details.
@JsonSerializable()
class DeleteStoreCustomersMeAddressesAddressIdResponse {
  const DeleteStoreCustomersMeAddressesAddressIdResponse({
    required this.id,
    required this.deleted,
    this.parent,
    this.object = 'address',
  });

  factory DeleteStoreCustomersMeAddressesAddressIdResponse.fromJson(
    Map<String, Object?> json,
  ) => _$DeleteStoreCustomersMeAddressesAddressIdResponseFromJson(json);

  /// The address's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the address was deleted.
  final bool deleted;

  /// The details of the customer the address belongs to.
  final StoreCustomer? parent;

  Map<String, Object?> toJson() =>
      _$DeleteStoreCustomersMeAddressesAddressIdResponseToJson(this);
}
