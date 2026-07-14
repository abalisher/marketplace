// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_product_alternative.dart';

part 'store_product_alternatives_res.g.dart';

@JsonSerializable()
class StoreProductAlternativesRes {
  const StoreProductAlternativesRes({required this.alternatives});

  factory StoreProductAlternativesRes.fromJson(Map<String, Object?> json) =>
      _$StoreProductAlternativesResFromJson(json);

  final List<StoreProductAlternative> alternatives;

  Map<String, Object?> toJson() => _$StoreProductAlternativesResToJson(this);
}
