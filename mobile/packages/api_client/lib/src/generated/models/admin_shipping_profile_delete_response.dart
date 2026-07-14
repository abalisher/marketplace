// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_shipping_profile_delete_response.g.dart';

/// The details of the shipping profile's deletion.
@JsonSerializable()
class AdminShippingProfileDeleteResponse {
  const AdminShippingProfileDeleteResponse({
    required this.id,
    required this.deleted,
    this.object = 'shipping_profile',
  });

  factory AdminShippingProfileDeleteResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminShippingProfileDeleteResponseFromJson(json);

  /// The shipping profile's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the shipping profile was deleted.
  final bool deleted;

  Map<String, Object?> toJson() =>
      _$AdminShippingProfileDeleteResponseToJson(this);
}
