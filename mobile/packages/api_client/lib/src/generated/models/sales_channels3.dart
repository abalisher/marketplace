// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'sales_channels3.g.dart';

@JsonSerializable()
class SalesChannels3 {
  const SalesChannels3({required this.id});

  factory SalesChannels3.fromJson(Map<String, Object?> json) =>
      _$SalesChannels3FromJson(json);

  /// The sales channel's ID.
  final String id;

  Map<String, Object?> toJson() => _$SalesChannels3ToJson(this);
}
