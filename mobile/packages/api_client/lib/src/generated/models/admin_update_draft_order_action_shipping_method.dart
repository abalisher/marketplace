// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_draft_order_action_shipping_method.g.dart';

/// The updates to make on a changed shipping method.
@JsonSerializable()
class AdminUpdateDraftOrderActionShippingMethod {
  const AdminUpdateDraftOrderActionShippingMethod({
    required this.shippingOptionId,
    this.customAmount,
    this.description,
    this.internalNote,
    this.metadata,
  });

  factory AdminUpdateDraftOrderActionShippingMethod.fromJson(
    Map<String, Object?> json,
  ) => _$AdminUpdateDraftOrderActionShippingMethodFromJson(json);

  /// The ID of the associated shipping option.
  @JsonKey(name: 'shipping_option_id')
  final String shippingOptionId;

  /// The custom amount of the shipping method. If not provided, the shipping option's amount will be used.
  @JsonKey(name: 'custom_amount')
  final num? customAmount;

  /// The shipping method's description.
  final String? description;

  /// A note viewed only by admin users about the shipping method.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// The shipping method's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() =>
      _$AdminUpdateDraftOrderActionShippingMethodToJson(this);
}
