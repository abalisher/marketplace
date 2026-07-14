// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_fulfillment_provider_option.g.dart';

/// The fulfillment option's details.
@JsonSerializable()
class AdminFulfillmentProviderOption {
  const AdminFulfillmentProviderOption({
    required this.id,
    required this.isReturn,
  });

  factory AdminFulfillmentProviderOption.fromJson(Map<String, Object?> json) =>
      _$AdminFulfillmentProviderOptionFromJson(json);

  /// The fulfillment option's ID.
  final String id;

  /// Whether the fulfillment option is used for returns.
  @JsonKey(name: 'is_return')
  final bool isReturn;

  Map<String, Object?> toJson() => _$AdminFulfillmentProviderOptionToJson(this);
}
