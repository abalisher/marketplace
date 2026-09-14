// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_card.dart';

part 'admin_order_card_res.g.dart';

@JsonSerializable()
class AdminOrderCardRes {
  const AdminOrderCardRes({required this.orderCard});

  factory AdminOrderCardRes.fromJson(Map<String, Object?> json) =>
      _$AdminOrderCardResFromJson(json);

  @JsonKey(name: 'order_card')
  final AdminOrderCard orderCard;

  Map<String, Object?> toJson() => _$AdminOrderCardResToJson(this);
}
