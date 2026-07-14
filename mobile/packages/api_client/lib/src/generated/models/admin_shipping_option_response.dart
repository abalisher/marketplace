// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_shipping_option.dart';

part 'admin_shipping_option_response.g.dart';

/// The shipping option's details.
@JsonSerializable()
class AdminShippingOptionResponse {
  const AdminShippingOptionResponse({required this.shippingOption});

  factory AdminShippingOptionResponse.fromJson(Map<String, Object?> json) =>
      _$AdminShippingOptionResponseFromJson(json);

  @JsonKey(name: 'shipping_option')
  final AdminShippingOption shippingOption;

  Map<String, Object?> toJson() => _$AdminShippingOptionResponseToJson(this);
}
