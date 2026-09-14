// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_store_credit_account.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateStoreCreditAccount _$AdminCreateStoreCreditAccountFromJson(
  Map<String, dynamic> json,
) => AdminCreateStoreCreditAccount(
  currencyCode: json['currency_code'] as String,
  customerId: json['customer_id'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminCreateStoreCreditAccountToJson(
  AdminCreateStoreCreditAccount instance,
) => <String, dynamic>{
  'currency_code': instance.currencyCode,
  'customer_id': ?instance.customerId,
  'metadata': ?instance.metadata,
};
