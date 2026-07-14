// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'items9.dart';

part 'admin_receive_items.g.dart';

/// The items details.
@JsonSerializable()
class AdminReceiveItems {
  const AdminReceiveItems({this.items});

  factory AdminReceiveItems.fromJson(Map<String, Object?> json) =>
      _$AdminReceiveItemsFromJson(json);

  /// The items details.
  final List<Items9>? items;

  Map<String, Object?> toJson() => _$AdminReceiveItemsToJson(this);
}
