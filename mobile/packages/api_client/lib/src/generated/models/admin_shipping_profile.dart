// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_shipping_profile.g.dart';

/// The shipping profile's details..
@JsonSerializable()
class AdminShippingProfile {
  const AdminShippingProfile({
    required this.id,
    required this.name,
    required this.type,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory AdminShippingProfile.fromJson(Map<String, Object?> json) =>
      _$AdminShippingProfileFromJson(json);

  /// The shipping profile's ID.
  final String id;

  /// The shipping profile's name.
  final String name;

  /// The shipping profile's type.
  final String type;

  /// The shipping profile's metadata, holds custom key-value pairs.
  final dynamic metadata;

  /// The date the shipping profile was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the shipping profile was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the shipping profile was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  Map<String, Object?> toJson() => _$AdminShippingProfileToJson(this);
}
