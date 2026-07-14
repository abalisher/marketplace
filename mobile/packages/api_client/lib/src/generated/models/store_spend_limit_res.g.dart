// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_spend_limit_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreSpendLimitRes _$StoreSpendLimitResFromJson(Map<String, dynamic> json) =>
    StoreSpendLimitRes(
      spendLimit: StoreSpendLimit.fromJson(
        json['spend_limit'] as Map<String, dynamic>,
      ),
    );

Map<String, dynamic> _$StoreSpendLimitResToJson(StoreSpendLimitRes instance) =>
    <String, dynamic>{'spend_limit': instance.spendLimit};
