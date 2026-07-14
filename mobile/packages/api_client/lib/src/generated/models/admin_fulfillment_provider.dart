// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_fulfillment_provider.g.dart';

/// The fulfillment provider's details.
@JsonSerializable()
class AdminFulfillmentProvider {
  const AdminFulfillmentProvider({required this.id, required this.isEnabled});

  factory AdminFulfillmentProvider.fromJson(Map<String, Object?> json) =>
      _$AdminFulfillmentProviderFromJson(json);

  /// The provider's ID.
  final String id;

  /// The provider's is enabled.
  @JsonKey(name: 'is_enabled')
  final bool isEnabled;

  Map<String, Object?> toJson() => _$AdminFulfillmentProviderToJson(this);
}
