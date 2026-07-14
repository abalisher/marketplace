// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_shipping_profile.dart';

part 'admin_shipping_profile_response.g.dart';

/// The shipping profile's details.
@JsonSerializable()
class AdminShippingProfileResponse {
  const AdminShippingProfileResponse({required this.shippingProfile});

  factory AdminShippingProfileResponse.fromJson(Map<String, Object?> json) =>
      _$AdminShippingProfileResponseFromJson(json);

  @JsonKey(name: 'shipping_profile')
  final AdminShippingProfile shippingProfile;

  Map<String, Object?> toJson() => _$AdminShippingProfileResponseToJson(this);
}
