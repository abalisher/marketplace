// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_add_return_item.dart';

part 'admin_add_return_items.g.dart';

/// The items' details.
@JsonSerializable()
class AdminAddReturnItems {
  const AdminAddReturnItems({required this.items});

  factory AdminAddReturnItems.fromJson(Map<String, Object?> json) =>
      _$AdminAddReturnItemsFromJson(json);

  /// The items' details.
  final List<AdminAddReturnItem> items;

  Map<String, Object?> toJson() => _$AdminAddReturnItemsToJson(this);
}
