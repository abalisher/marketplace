// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_carts_id_line_items_line_id_request_body.g.dart';

/// The details to update in the line item.
@JsonSerializable()
class StoreCartsIdLineItemsLineIdRequestBody {
  const StoreCartsIdLineItemsLineIdRequestBody({
    required this.quantity,
    this.metadata,
    this.additionalData,
  });

  factory StoreCartsIdLineItemsLineIdRequestBody.fromJson(
    Map<String, Object?> json,
  ) => _$StoreCartsIdLineItemsLineIdRequestBodyFromJson(json);

  /// The item's quantity.
  final num quantity;

  /// The item's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// Pass additional custom data to the API route. This data is passed to the underlying workflow under the `additional_data` parameter.
  @JsonKey(name: 'additional_data')
  final dynamic additionalData;

  Map<String, Object?> toJson() =>
      _$StoreCartsIdLineItemsLineIdRequestBodyToJson(this);
}
