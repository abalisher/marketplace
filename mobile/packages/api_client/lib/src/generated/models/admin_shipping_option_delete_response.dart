// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_shipping_option_delete_response.g.dart';

/// The details of the shipping option's deletion.
@JsonSerializable()
class AdminShippingOptionDeleteResponse {
  const AdminShippingOptionDeleteResponse({
    required this.id,
    required this.deleted,
    this.object = 'shipping_option',
  });

  factory AdminShippingOptionDeleteResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminShippingOptionDeleteResponseFromJson(json);

  /// The shipping option's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the shipping option was deleted.
  final bool deleted;

  Map<String, Object?> toJson() =>
      _$AdminShippingOptionDeleteResponseToJson(this);
}
