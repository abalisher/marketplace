// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_gift_card.dart';

part 'admin_gift_card_response.g.dart';

/// The gift card's details.
@JsonSerializable()
class AdminGiftCardResponse {
  const AdminGiftCardResponse({required this.giftCard});

  factory AdminGiftCardResponse.fromJson(Map<String, Object?> json) =>
      _$AdminGiftCardResponseFromJson(json);

  @JsonKey(name: 'gift_card')
  final AdminGiftCard giftCard;

  Map<String, Object?> toJson() => _$AdminGiftCardResponseToJson(this);
}
