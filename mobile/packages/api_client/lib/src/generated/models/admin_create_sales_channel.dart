// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_sales_channel.g.dart';

/// The sales channel's details.
@JsonSerializable()
class AdminCreateSalesChannel {
  const AdminCreateSalesChannel({
    required this.name,
    this.description,
    this.isDisabled,
    this.metadata,
  });

  factory AdminCreateSalesChannel.fromJson(Map<String, Object?> json) =>
      _$AdminCreateSalesChannelFromJson(json);

  /// The sales channel's name.
  final String name;

  /// The sales channel's description.
  final String? description;

  /// Whether the sales channel is disabled.
  @JsonKey(name: 'is_disabled')
  final bool? isDisabled;

  /// The sales channel's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminCreateSalesChannelToJson(this);
}
