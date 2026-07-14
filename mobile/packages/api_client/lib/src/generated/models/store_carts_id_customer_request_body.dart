// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_carts_id_customer_request_body.g.dart';

@JsonSerializable()
class StoreCartsIdCustomerRequestBody {
  const StoreCartsIdCustomerRequestBody({this.additionalData});

  factory StoreCartsIdCustomerRequestBody.fromJson(Map<String, Object?> json) =>
      _$StoreCartsIdCustomerRequestBodyFromJson(json);

  /// Pass additional custom data to the API route. This data is passed to the underlying workflow under the `additional_data` parameter.
  @JsonKey(name: 'additional_data')
  final dynamic additionalData;

  Map<String, Object?> toJson() =>
      _$StoreCartsIdCustomerRequestBodyToJson(this);
}
