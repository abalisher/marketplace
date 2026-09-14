// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_store_credit_account.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreStoreCreditAccount _$StoreStoreCreditAccountFromJson(
  Map<String, dynamic> json,
) => StoreStoreCreditAccount(
  customer: StoreCustomer.fromJson(json['customer'] as Map<String, dynamic>),
  id: json['id'] as String,
  currencyCode: json['currency_code'] as String,
  credits: json['credits'] as num,
  debits: json['debits'] as num,
  balance: json['balance'] as num,
  metadata: json['metadata'],
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  customerId: json['customer_id'] as String?,
  code: json['code'] as String?,
);

Map<String, dynamic> _$StoreStoreCreditAccountToJson(
  StoreStoreCreditAccount instance,
) => <String, dynamic>{
  'customer': instance.customer,
  'id': instance.id,
  'customer_id': ?instance.customerId,
  'currency_code': instance.currencyCode,
  'credits': instance.credits,
  'debits': instance.debits,
  'balance': instance.balance,
  'metadata': ?instance.metadata,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
  'code': ?instance.code,
};
