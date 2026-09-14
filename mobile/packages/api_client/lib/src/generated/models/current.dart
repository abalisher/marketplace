// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'current.g.dart';

@JsonSerializable()
class Current {
  const Current({this.date, this.window});

  factory Current.fromJson(Map<String, Object?> json) =>
      _$CurrentFromJson(json);

  final String? date;
  final String? window;

  Map<String, Object?> toJson() => _$CurrentToJson(this);
}
