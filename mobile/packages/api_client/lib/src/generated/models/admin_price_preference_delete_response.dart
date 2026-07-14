// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_price_preference_delete_response.g.dart';

/// The details of the deleted price preference.
@JsonSerializable()
class AdminPricePreferenceDeleteResponse {
  const AdminPricePreferenceDeleteResponse({
    required this.id,
    required this.deleted,
    this.object = 'price_preference',
  });

  factory AdminPricePreferenceDeleteResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminPricePreferenceDeleteResponseFromJson(json);

  /// The price preference's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the price preference was deleted.
  final bool deleted;

  Map<String, Object?> toJson() =>
      _$AdminPricePreferenceDeleteResponseToJson(this);
}
