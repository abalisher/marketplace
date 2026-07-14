// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'base_fulfillment_provider.g.dart';

/// The fulfillment provider's details.
@JsonSerializable()
class BaseFulfillmentProvider {
  const BaseFulfillmentProvider({required this.id, required this.isEnabled});

  factory BaseFulfillmentProvider.fromJson(Map<String, Object?> json) =>
      _$BaseFulfillmentProviderFromJson(json);

  /// The provider's ID.
  final String id;

  /// Whether the provider is enabled.
  @JsonKey(name: 'is_enabled')
  final bool isEnabled;

  Map<String, Object?> toJson() => _$BaseFulfillmentProviderToJson(this);
}
