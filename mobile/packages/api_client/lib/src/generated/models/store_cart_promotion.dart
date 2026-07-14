// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'application_method.dart';

part 'store_cart_promotion.g.dart';

/// The promotion's promotions.
@JsonSerializable()
class StoreCartPromotion {
  const StoreCartPromotion({
    required this.id,
    this.code,
    this.isAutomatic,
    this.applicationMethod,
  });

  factory StoreCartPromotion.fromJson(Map<String, Object?> json) =>
      _$StoreCartPromotionFromJson(json);

  /// The promotion's ID.
  final String id;

  /// The promotion's code.
  final String? code;

  /// The promotion's is automatic.
  @JsonKey(name: 'is_automatic')
  final bool? isAutomatic;

  /// The promotion's application method.
  @JsonKey(name: 'application_method')
  final ApplicationMethod? applicationMethod;

  Map<String, Object?> toJson() => _$StoreCartPromotionToJson(this);
}
