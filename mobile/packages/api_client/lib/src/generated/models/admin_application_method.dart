// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_application_method_allocation.dart';
import 'admin_application_method_target_type.dart';
import 'admin_application_method_type.dart';
import 'admin_promotion_rule.dart';

part 'admin_application_method.g.dart';

/// The application method's details.
@JsonSerializable()
class AdminApplicationMethod {
  const AdminApplicationMethod({
    required this.id,
    this.promotion,
    this.targetRules,
    this.buyRules,
    this.type,
    this.targetType,
    this.allocation,
    this.value,
    this.currencyCode,
    this.maxQuantity,
    this.buyRulesMinQuantity,
    this.applyToQuantity,
  });

  factory AdminApplicationMethod.fromJson(Map<String, Object?> json) =>
      _$AdminApplicationMethodFromJson(json);

  final dynamic promotion;

  /// The application method's target rules.
  @JsonKey(name: 'target_rules')
  final List<AdminPromotionRule>? targetRules;

  /// The application method's buy rules.
  @JsonKey(name: 'buy_rules')
  final List<AdminPromotionRule>? buyRules;

  /// The application method's ID.
  final String id;

  /// The application method's type. If it's `fixed`, the promotion discounts a fixed amount. If it's `percentage`, the promotion discounts a percentage.
  final AdminApplicationMethodType? type;

  /// Which item does the promotion apply to. `items` mean the promotion applies to the cart's items; `shipping_methods` means the promotion applies to the cart's shipping methods; `order` means the promotion applies on the entire order.
  @JsonKey(name: 'target_type')
  final AdminApplicationMethodTargetType? targetType;

  /// How is the promotion amount discounted. `each` means the discounted amount is applied on each applicable item; `across` means the discounted amount is split accross the applicable items.
  final AdminApplicationMethodAllocation? allocation;

  /// The amount to be discounted.
  final num? value;

  /// The application method's currency code.
  @JsonKey(name: 'currency_code')
  final String? currencyCode;

  /// The max quantity allowed in the cart for the associated promotion to be applied.
  @JsonKey(name: 'max_quantity')
  final num? maxQuantity;

  /// The minimum quantity required for a `buyget` promotion to be applied. For example, if the promotion is a "Buy 2 shirts get 1 free", the value of this attribute is `2`.
  @JsonKey(name: 'buy_rules_min_quantity')
  final num? buyRulesMinQuantity;

  /// The quantity that results from matching the `buyget` promotion's condition. For example, if the promotion is a "Buy 2 shirts get 1 free", the value of this attribute is `1`.
  @JsonKey(name: 'apply_to_quantity')
  final num? applyToQuantity;

  Map<String, Object?> toJson() => _$AdminApplicationMethodToJson(this);
}
