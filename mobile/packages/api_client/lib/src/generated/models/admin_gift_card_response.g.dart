// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_gift_card_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminGiftCardResponse _$AdminGiftCardResponseFromJson(
  Map<String, dynamic> json,
) => AdminGiftCardResponse(
  giftCard: AdminGiftCard.fromJson(json['gift_card'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminGiftCardResponseToJson(
  AdminGiftCardResponse instance,
) => <String, dynamic>{'gift_card': instance.giftCard};
