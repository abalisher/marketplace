// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'params.dart';

part 'store_create_estimate.g.dart';

@JsonSerializable()
class StoreCreateEstimate {
  const StoreCreateEstimate({this.params, this.normCodes, this.note});

  factory StoreCreateEstimate.fromJson(Map<String, Object?> json) =>
      _$StoreCreateEstimateFromJson(json);

  /// Параметры помещения/работы для расчёта.
  final Params? params;

  /// Коды нормативов (иначе — все активные).
  @JsonKey(name: 'norm_codes')
  final List<String>? normCodes;
  final String? note;

  Map<String, Object?> toJson() => _$StoreCreateEstimateToJson(this);
}
