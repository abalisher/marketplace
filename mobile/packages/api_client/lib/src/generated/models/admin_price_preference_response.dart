// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_price_preference.dart';

part 'admin_price_preference_response.g.dart';

/// The price preference's details.
@JsonSerializable()
class AdminPricePreferenceResponse {
  const AdminPricePreferenceResponse({required this.pricePreference});

  factory AdminPricePreferenceResponse.fromJson(Map<String, Object?> json) =>
      _$AdminPricePreferenceResponseFromJson(json);

  @JsonKey(name: 'price_preference')
  final AdminPricePreference pricePreference;

  Map<String, Object?> toJson() => _$AdminPricePreferenceResponseToJson(this);
}
