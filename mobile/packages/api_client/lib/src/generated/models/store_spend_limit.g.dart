// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_spend_limit.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreSpendLimit _$StoreSpendLimitFromJson(Map<String, dynamic> json) =>
    StoreSpendLimit(
      id: json['id'] as String,
      amount: json['amount'] as num,
      currencyCode: json['currency_code'] as String,
      period: StoreSpendLimitPeriod.fromJson(json['period'] as String),
      employeeId: json['employee_id'] as String?,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] == null
          ? null
          : DateTime.parse(json['updated_at'] as String),
    );

Map<String, dynamic> _$StoreSpendLimitToJson(StoreSpendLimit instance) =>
    <String, dynamic>{
      'id': instance.id,
      'amount': instance.amount,
      'currency_code': instance.currencyCode,
      'period': _$StoreSpendLimitPeriodEnumMap[instance.period]!,
      'employee_id': instance.employeeId,
      'created_at': instance.createdAt?.toIso8601String(),
      'updated_at': instance.updatedAt?.toIso8601String(),
    };

const _$StoreSpendLimitPeriodEnumMap = {
  StoreSpendLimitPeriod.order: 'order',
  StoreSpendLimitPeriod.day: 'day',
  StoreSpendLimitPeriod.week: 'week',
  StoreSpendLimitPeriod.month: 'month',
  StoreSpendLimitPeriod.$unknown: r'$unknown',
};
