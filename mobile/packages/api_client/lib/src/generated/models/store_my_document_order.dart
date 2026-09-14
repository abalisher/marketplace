// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_my_document_order.g.dart';

@JsonSerializable()
class StoreMyDocumentOrder {
  const StoreMyDocumentOrder({required this.id, this.displayId});

  factory StoreMyDocumentOrder.fromJson(Map<String, Object?> json) =>
      _$StoreMyDocumentOrderFromJson(json);

  final String id;

  /// Человекочитаемый номер заказа.
  @JsonKey(name: 'display_id')
  final int? displayId;

  Map<String, Object?> toJson() => _$StoreMyDocumentOrderToJson(this);
}
