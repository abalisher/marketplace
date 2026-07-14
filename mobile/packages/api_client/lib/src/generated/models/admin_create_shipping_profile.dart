// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_shipping_profile.g.dart';

/// The shipping profile's details.
@JsonSerializable()
class AdminCreateShippingProfile {
  const AdminCreateShippingProfile({
    required this.name,
    required this.type,
    this.metadata,
  });

  factory AdminCreateShippingProfile.fromJson(Map<String, Object?> json) =>
      _$AdminCreateShippingProfileFromJson(json);

  /// The shipping profile's name.
  final String name;

  /// The shipping profile's type.
  final String type;

  /// The shipping profile's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminCreateShippingProfileToJson(this);
}
