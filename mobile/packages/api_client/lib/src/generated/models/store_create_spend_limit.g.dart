// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_create_spend_limit.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCreateSpendLimit _$StoreCreateSpendLimitFromJson(
  Map<String, dynamic> json,
) => StoreCreateSpendLimit(
  amount: json['amount'] as num,
  period: StoreCreateSpendLimitPeriod.fromJson(json['period'] as String),
  currencyCode: json['currency_code'] as String?,
);

Map<String, dynamic> _$StoreCreateSpendLimitToJson(
  StoreCreateSpendLimit instance,
) => <String, dynamic>{
  'amount': instance.amount,
  'period': _$StoreCreateSpendLimitPeriodEnumMap[instance.period]!,
  'currency_code': instance.currencyCode,
};

const _$StoreCreateSpendLimitPeriodEnumMap = {
  StoreCreateSpendLimitPeriod.order: 'order',
  StoreCreateSpendLimitPeriod.day: 'day',
  StoreCreateSpendLimitPeriod.week: 'week',
  StoreCreateSpendLimitPeriod.month: 'month',
  StoreCreateSpendLimitPeriod.$unknown: r'$unknown',
};
