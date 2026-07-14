// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'items6.dart';

part 'admin_dismiss_items.g.dart';

/// The items details.
@JsonSerializable()
class AdminDismissItems {
  const AdminDismissItems({this.items});

  factory AdminDismissItems.fromJson(Map<String, Object?> json) =>
      _$AdminDismissItemsFromJson(json);

  /// The items details.
  final List<Items6>? items;

  Map<String, Object?> toJson() => _$AdminDismissItemsToJson(this);
}
