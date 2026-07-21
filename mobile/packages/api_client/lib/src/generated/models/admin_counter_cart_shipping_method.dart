// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_counter_cart_shipping_method.g.dart';

@JsonSerializable()
class AdminCounterCartShippingMethod {
  const AdminCounterCartShippingMethod({required this.id, required this.name});

  factory AdminCounterCartShippingMethod.fromJson(Map<String, Object?> json) =>
      _$AdminCounterCartShippingMethodFromJson(json);

  final String id;
  final String name;

  Map<String, Object?> toJson() => _$AdminCounterCartShippingMethodToJson(this);
}
