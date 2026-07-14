// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_return_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreReturnResponse _$StoreReturnResponseFromJson(Map<String, dynamic> json) =>
    StoreReturnResponse(
      returnValue: StoreReturn.fromJson(json['return'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$StoreReturnResponseToJson(
  StoreReturnResponse instance,
) => <String, dynamic>{'return': instance.returnValue};
