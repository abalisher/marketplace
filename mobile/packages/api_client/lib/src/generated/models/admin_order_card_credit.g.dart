// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_card_credit.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderCardCredit _$AdminOrderCardCreditFromJson(
  Map<String, dynamic> json,
) => AdminOrderCardCredit(
  limit: json['limit'] as num,
  available: json['available'] as num,
  reserved: json['reserved'] as num,
);

Map<String, dynamic> _$AdminOrderCardCreditToJson(
  AdminOrderCardCredit instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'available': instance.available,
  'reserved': instance.reserved,
};
