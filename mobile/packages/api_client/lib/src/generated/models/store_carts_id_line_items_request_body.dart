// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_carts_id_line_items_request_body.g.dart';

/// The details of the line item to add.
@JsonSerializable()
class StoreCartsIdLineItemsRequestBody {
  const StoreCartsIdLineItemsRequestBody({
    required this.variantId,
    required this.quantity,
    this.metadata,
    this.additionalData,
  });

  factory StoreCartsIdLineItemsRequestBody.fromJson(
    Map<String, Object?> json,
  ) => _$StoreCartsIdLineItemsRequestBodyFromJson(json);

  /// The ID of the product variant to add as a line item.
  @JsonKey(name: 'variant_id')
  final String variantId;

  /// The item's quantity.
  final num quantity;

  /// The item's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// Pass additional custom data to the API route. This data is passed to the underlying workflow under the `additional_data` parameter.
  @JsonKey(name: 'additional_data')
  final dynamic additionalData;

  Map<String, Object?> toJson() =>
      _$StoreCartsIdLineItemsRequestBodyToJson(this);
}
