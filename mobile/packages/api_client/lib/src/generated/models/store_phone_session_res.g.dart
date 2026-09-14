// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_phone_session_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StorePhoneSessionRes _$StorePhoneSessionResFromJson(
  Map<String, dynamic> json,
) => StorePhoneSessionRes(
  token: json['token'] as String,
  customer: StorePhoneAuthCustomer.fromJson(
    json['customer'] as Map<String, dynamic>,
  ),
  created: json['created'] as bool,
);

Map<String, dynamic> _$StorePhoneSessionResToJson(
  StorePhoneSessionRes instance,
) => <String, dynamic>{
  'token': instance.token,
  'customer': instance.customer,
  'created': instance.created,
};
