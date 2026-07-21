// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_counter_cart_credit_line.g.dart';

@JsonSerializable()
class AdminCounterCartCreditLine {
  const AdminCounterCartCreditLine({required this.id, required this.amount});

  factory AdminCounterCartCreditLine.fromJson(Map<String, Object?> json) =>
      _$AdminCounterCartCreditLineFromJson(json);

  final String id;
  final num amount;

  Map<String, Object?> toJson() => _$AdminCounterCartCreditLineToJson(this);
}
