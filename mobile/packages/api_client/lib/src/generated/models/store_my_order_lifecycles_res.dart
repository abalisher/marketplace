// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_my_order_lifecycle.dart';

part 'store_my_order_lifecycles_res.g.dart';

@JsonSerializable()
class StoreMyOrderLifecyclesRes {
  const StoreMyOrderLifecyclesRes({required this.lifecycles});

  factory StoreMyOrderLifecyclesRes.fromJson(Map<String, Object?> json) =>
      _$StoreMyOrderLifecyclesResFromJson(json);

  final List<StoreMyOrderLifecycle> lifecycles;

  Map<String, Object?> toJson() => _$StoreMyOrderLifecyclesResToJson(this);
}
