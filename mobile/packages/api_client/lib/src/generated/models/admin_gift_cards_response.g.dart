// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_gift_cards_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminGiftCardsResponse _$AdminGiftCardsResponseFromJson(
  Map<String, dynamic> json,
) => AdminGiftCardsResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  giftCards: (json['gift_cards'] as List<dynamic>)
      .map((e) => AdminGiftCard.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$AdminGiftCardsResponseToJson(
  AdminGiftCardsResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'gift_cards': instance.giftCards,
  'estimate_count': instance.estimateCount,
};
