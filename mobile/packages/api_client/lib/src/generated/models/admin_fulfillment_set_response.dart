// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_fulfillment_set.dart';

part 'admin_fulfillment_set_response.g.dart';

/// The fulfillment set's details.
@JsonSerializable()
class AdminFulfillmentSetResponse {
  const AdminFulfillmentSetResponse({required this.fulfillmentSet});

  factory AdminFulfillmentSetResponse.fromJson(Map<String, Object?> json) =>
      _$AdminFulfillmentSetResponseFromJson(json);

  @JsonKey(name: 'fulfillment_set')
  final AdminFulfillmentSet fulfillmentSet;

  Map<String, Object?> toJson() => _$AdminFulfillmentSetResponseToJson(this);
}
