// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_draft_order.dart';

part 'admin_draft_order_response.g.dart';

/// The draft order's details.
@JsonSerializable()
class AdminDraftOrderResponse {
  const AdminDraftOrderResponse({required this.draftOrder});

  factory AdminDraftOrderResponse.fromJson(Map<String, Object?> json) =>
      _$AdminDraftOrderResponseFromJson(json);

  @JsonKey(name: 'draft_order')
  final AdminDraftOrder draftOrder;

  Map<String, Object?> toJson() => _$AdminDraftOrderResponseToJson(this);
}
