// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_bonus.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreBonus _$StoreBonusFromJson(Map<String, dynamic> json) => StoreBonus(
  balance: (json['balance'] as num).toInt(),
  currencyCode: json['currency_code'] as String,
  transactions: (json['transactions'] as List<dynamic>)
      .map((e) => StoreBonusTransaction.fromJson(e as Map<String, dynamic>))
      .toList(),
  count: (json['count'] as num).toInt(),
  limit: (json['limit'] as num).toInt(),
  offset: (json['offset'] as num).toInt(),
);

Map<String, dynamic> _$StoreBonusToJson(StoreBonus instance) =>
    <String, dynamic>{
      'balance': instance.balance,
      'currency_code': instance.currencyCode,
      'transactions': instance.transactions,
      'count': instance.count,
      'limit': instance.limit,
      'offset': instance.offset,
    };
