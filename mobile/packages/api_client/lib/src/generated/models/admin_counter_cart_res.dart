// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_counter_cart.dart';

part 'admin_counter_cart_res.g.dart';

@JsonSerializable()
class AdminCounterCartRes {
  const AdminCounterCartRes({required this.cart});

  factory AdminCounterCartRes.fromJson(Map<String, Object?> json) =>
      _$AdminCounterCartResFromJson(json);

  final AdminCounterCart cart;

  Map<String, Object?> toJson() => _$AdminCounterCartResToJson(this);
}
