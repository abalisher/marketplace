// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'sales_channels.g.dart';

@JsonSerializable()
class SalesChannels {
  const SalesChannels({required this.id});

  factory SalesChannels.fromJson(Map<String, Object?> json) =>
      _$SalesChannelsFromJson(json);

  /// The sales channel's ID.
  final String id;

  Map<String, Object?> toJson() => _$SalesChannelsToJson(this);
}
