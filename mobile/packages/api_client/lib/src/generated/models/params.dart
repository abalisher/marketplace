// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'params.g.dart';

@JsonSerializable()
class Params {
  const Params({this.area, this.volume, this.length, this.height, this.count});

  factory Params.fromJson(Map<String, Object?> json) => _$ParamsFromJson(json);

  final num? area;
  final num? volume;
  final num? length;
  final num? height;
  final num? count;

  Map<String, Object?> toJson() => _$ParamsToJson(this);
}
