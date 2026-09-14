// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_slot_option_window.dart';

part 'admin_order_slot_option.g.dart';

@JsonSerializable()
class AdminOrderSlotOption {
  const AdminOrderSlotOption({required this.date, required this.window});

  factory AdminOrderSlotOption.fromJson(Map<String, Object?> json) =>
      _$AdminOrderSlotOptionFromJson(json);

  final String date;
  final AdminOrderSlotOptionWindow window;

  Map<String, Object?> toJson() => _$AdminOrderSlotOptionToJson(this);
}
