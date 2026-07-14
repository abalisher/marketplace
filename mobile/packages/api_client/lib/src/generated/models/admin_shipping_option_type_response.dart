// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_shipping_option_type.dart';

part 'admin_shipping_option_type_response.g.dart';

/// The shipping option type's details.
@JsonSerializable()
class AdminShippingOptionTypeResponse {
  const AdminShippingOptionTypeResponse({required this.shippingOptionType});

  factory AdminShippingOptionTypeResponse.fromJson(Map<String, Object?> json) =>
      _$AdminShippingOptionTypeResponseFromJson(json);

  @JsonKey(name: 'shipping_option_type')
  final AdminShippingOptionType shippingOptionType;

  Map<String, Object?> toJson() =>
      _$AdminShippingOptionTypeResponseToJson(this);
}
