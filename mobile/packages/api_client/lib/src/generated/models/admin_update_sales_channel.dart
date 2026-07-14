// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_sales_channel.g.dart';

/// The properties to update in the sales channel.
@JsonSerializable()
class AdminUpdateSalesChannel {
  const AdminUpdateSalesChannel({
    this.name,
    this.description,
    this.isDisabled,
    this.metadata,
  });

  factory AdminUpdateSalesChannel.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateSalesChannelFromJson(json);

  /// The sales channel's name.
  final String? name;

  /// The sales channel's description.
  final String? description;

  /// Whether the sales channel is disabled.
  @JsonKey(name: 'is_disabled')
  final bool? isDisabled;

  /// The sales channel's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminUpdateSalesChannelToJson(this);
}
