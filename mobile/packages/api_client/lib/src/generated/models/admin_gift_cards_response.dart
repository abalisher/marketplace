// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_gift_card.dart';

part 'admin_gift_cards_response.g.dart';

/// The paginated list of gift cards.
@JsonSerializable()
class AdminGiftCardsResponse {
  const AdminGiftCardsResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.giftCards,
    this.estimateCount,
  });

  factory AdminGiftCardsResponse.fromJson(Map<String, Object?> json) =>
      _$AdminGiftCardsResponseFromJson(json);

  /// The maximum number of gift cards to return.
  final num limit;

  /// The number of gift cards to skip before retrieving the results.
  final num offset;

  /// The total number of gift cards available.
  final num count;

  /// The list of gift cards.
  @JsonKey(name: 'gift_cards')
  final List<AdminGiftCard> giftCards;

  /// The gift card's estimate count.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  Map<String, Object?> toJson() => _$AdminGiftCardsResponseToJson(this);
}
