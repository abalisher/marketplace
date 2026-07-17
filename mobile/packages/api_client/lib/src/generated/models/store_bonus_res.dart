// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_bonus.dart';

part 'store_bonus_res.g.dart';

@JsonSerializable()
class StoreBonusRes {
  const StoreBonusRes({required this.bonus});

  factory StoreBonusRes.fromJson(Map<String, Object?> json) =>
      _$StoreBonusResFromJson(json);

  final StoreBonus bonus;

  Map<String, Object?> toJson() => _$StoreBonusResToJson(this);
}
