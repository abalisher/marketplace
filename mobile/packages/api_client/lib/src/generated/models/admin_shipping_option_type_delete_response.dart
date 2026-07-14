// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_shipping_option_type_delete_response.g.dart';

/// The response returned after deleting a shipping option type.
@JsonSerializable()
class AdminShippingOptionTypeDeleteResponse {
  const AdminShippingOptionTypeDeleteResponse({
    required this.id,
    required this.deleted,
    this.object = 'shipping_option_type',
  });

  factory AdminShippingOptionTypeDeleteResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminShippingOptionTypeDeleteResponseFromJson(json);

  /// The shipping option type's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the Shipping Option Type was deleted.
  final bool deleted;

  Map<String, Object?> toJson() =>
      _$AdminShippingOptionTypeDeleteResponseToJson(this);
}
