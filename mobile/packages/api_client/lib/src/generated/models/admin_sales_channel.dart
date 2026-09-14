// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_sales_channel.g.dart';

/// The sales channel's details.
@JsonSerializable()
class AdminSalesChannel {
  const AdminSalesChannel({
    required this.id,
    required this.name,
    required this.description,
    required this.isDisabled,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory AdminSalesChannel.fromJson(Map<String, Object?> json) =>
      _$AdminSalesChannelFromJson(json);

  /// The sales channel's ID.
  final String id;

  /// The sales channel's name.
  final String name;

  /// The sales channel's description.
  final String? description;

  /// Whether the sales channel is disabled.
  @JsonKey(name: 'is_disabled')
  final bool isDisabled;

  /// The sales channel's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the sales channel was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the sales channel was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the sales channel was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  Map<String, Object?> toJson() => _$AdminSalesChannelToJson(this);
}
