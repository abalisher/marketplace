// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_shipping_profile.g.dart';

/// The properties to update in the shipping profile.
@JsonSerializable()
class AdminUpdateShippingProfile {
  const AdminUpdateShippingProfile({this.name, this.type, this.metadata});

  factory AdminUpdateShippingProfile.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateShippingProfileFromJson(json);

  /// The shipping profile's name.
  final String? name;

  /// The shipping profile's type.
  final String? type;

  /// The shipping profile's metadata.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminUpdateShippingProfileToJson(this);
}
