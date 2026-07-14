// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_fulfillment.dart';

part 'admin_fulfillment_response.g.dart';

/// A fulfillment's details.
@JsonSerializable()
class AdminFulfillmentResponse {
  const AdminFulfillmentResponse({required this.fulfillment});

  factory AdminFulfillmentResponse.fromJson(Map<String, Object?> json) =>
      _$AdminFulfillmentResponseFromJson(json);

  final AdminFulfillment fulfillment;

  Map<String, Object?> toJson() => _$AdminFulfillmentResponseToJson(this);
}
