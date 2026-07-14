// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_payment_collection.dart';

part 'store_payment_collection_response.g.dart';

/// The payment collection's details.
@JsonSerializable()
class StorePaymentCollectionResponse {
  const StorePaymentCollectionResponse({required this.paymentCollection});

  factory StorePaymentCollectionResponse.fromJson(Map<String, Object?> json) =>
      _$StorePaymentCollectionResponseFromJson(json);

  @JsonKey(name: 'payment_collection')
  final StorePaymentCollection paymentCollection;

  Map<String, Object?> toJson() => _$StorePaymentCollectionResponseToJson(this);
}
