// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_company_document.dart';
import 'store_company_status.dart';

part 'store_company.g.dart';

@JsonSerializable()
class StoreCompany {
  const StoreCompany({
    required this.id,
    required this.name,
    required this.bin,
    required this.status,
    this.rejectionReason,
    this.documents,
    this.createdAt,
    this.updatedAt,
  });

  factory StoreCompany.fromJson(Map<String, Object?> json) =>
      _$StoreCompanyFromJson(json);

  final String id;
  final String name;

  /// БИН — 12 цифр.
  final String bin;
  final StoreCompanyStatus status;
  @JsonKey(name: 'rejection_reason')
  final String? rejectionReason;
  final List<StoreCompanyDocument>? documents;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  Map<String, Object?> toJson() => _$StoreCompanyToJson(this);
}
