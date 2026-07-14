// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_exchange.dart';

part 'admin_exchange_response.g.dart';

/// The exchange's details.
@JsonSerializable()
class AdminExchangeResponse {
  const AdminExchangeResponse({required this.exchange});

  factory AdminExchangeResponse.fromJson(Map<String, Object?> json) =>
      _$AdminExchangeResponseFromJson(json);

  final AdminExchange exchange;

  Map<String, Object?> toJson() => _$AdminExchangeResponseToJson(this);
}
