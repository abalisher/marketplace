// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'provider.g.dart';

@JsonSerializable()
class Provider {
  const Provider({required this.id, required this.isEnabled});

  factory Provider.fromJson(Map<String, Object?> json) =>
      _$ProviderFromJson(json);

  /// The provider's ID.
  final String id;

  /// Whether the provider is enabled.
  @JsonKey(name: 'is_enabled')
  final bool isEnabled;

  Map<String, Object?> toJson() => _$ProviderToJson(this);
}
