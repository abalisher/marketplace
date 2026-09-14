// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_store_credit_accounts_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreStoreCreditAccountsResponse _$StoreStoreCreditAccountsResponseFromJson(
  Map<String, dynamic> json,
) => StoreStoreCreditAccountsResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  storeCreditAccounts: (json['store_credit_accounts'] as List<dynamic>)
      .map((e) => StoreStoreCreditAccount.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$StoreStoreCreditAccountsResponseToJson(
  StoreStoreCreditAccountsResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'store_credit_accounts': instance.storeCreditAccounts,
  'estimate_count': ?instance.estimateCount,
};
