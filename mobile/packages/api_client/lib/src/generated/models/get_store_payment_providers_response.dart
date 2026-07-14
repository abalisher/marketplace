// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_payment_provider.dart';

part 'get_store_payment_providers_response.g.dart';

@JsonSerializable()
class GetStorePaymentProvidersResponse {
  const GetStorePaymentProvidersResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.paymentProviders,
  });

  factory GetStorePaymentProvidersResponse.fromJson(
    Map<String, Object?> json,
  ) => _$GetStorePaymentProvidersResponseFromJson(json);

  /// The maximum number of items returned.
  final num limit;

  /// The number of items skipped before retrieving the returned items.
  final num offset;

  /// The total number of items.
  final num count;

  /// The list of payment providers.
  @JsonKey(name: 'payment_providers')
  final List<StorePaymentProvider> paymentProviders;

  Map<String, Object?> toJson() =>
      _$GetStorePaymentProvidersResponseToJson(this);
}
