// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_return_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminReturnResponse _$AdminReturnResponseFromJson(Map<String, dynamic> json) =>
    AdminReturnResponse(
      returnValue: AdminReturn.fromJson(json['return'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$AdminReturnResponseToJson(
  AdminReturnResponse instance,
) => <String, dynamic>{'return': instance.returnValue};
