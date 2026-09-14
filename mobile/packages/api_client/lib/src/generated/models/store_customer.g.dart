// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_customer.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCustomer _$StoreCustomerFromJson(Map<String, dynamic> json) =>
    StoreCustomer(
      id: json['id'] as String,
      email: json['email'] as String,
      defaultBillingAddressId: json['default_billing_address_id'] as String?,
      defaultShippingAddressId: json['default_shipping_address_id'] as String?,
      companyName: json['company_name'] as String?,
      firstName: json['first_name'] as String?,
      lastName: json['last_name'] as String?,
      addresses: (json['addresses'] as List<dynamic>)
          .map((e) => StoreCustomerAddress.fromJson(e as Map<String, dynamic>))
          .toList(),
      phone: json['phone'] as String?,
      metadata: json['metadata'],
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] == null
          ? null
          : DateTime.parse(json['updated_at'] as String),
      deletedAt: json['deleted_at'] == null
          ? null
          : DateTime.parse(json['deleted_at'] as String),
    );

Map<String, dynamic> _$StoreCustomerToJson(StoreCustomer instance) =>
    <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'default_billing_address_id': ?instance.defaultBillingAddressId,
      'default_shipping_address_id': ?instance.defaultShippingAddressId,
      'company_name': ?instance.companyName,
      'first_name': ?instance.firstName,
      'last_name': ?instance.lastName,
      'addresses': instance.addresses,
      'phone': ?instance.phone,
      'metadata': ?instance.metadata,
      'created_at': ?instance.createdAt?.toIso8601String(),
      'updated_at': ?instance.updatedAt?.toIso8601String(),
      'deleted_at': ?instance.deletedAt?.toIso8601String(),
    };
