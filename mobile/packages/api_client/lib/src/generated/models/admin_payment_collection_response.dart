// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_payment_collection.dart';

part 'admin_payment_collection_response.g.dart';

/// The payment collection's details.
@JsonSerializable()
class AdminPaymentCollectionResponse {
  const AdminPaymentCollectionResponse({required this.paymentCollection});

  factory AdminPaymentCollectionResponse.fromJson(Map<String, Object?> json) =>
      _$AdminPaymentCollectionResponseFromJson(json);

  @JsonKey(name: 'payment_collection')
  final AdminPaymentCollection paymentCollection;

  Map<String, Object?> toJson() => _$AdminPaymentCollectionResponseToJson(this);
}
