// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_company.dart';

part 'store_company_res.g.dart';

@JsonSerializable()
class StoreCompanyRes {
  const StoreCompanyRes({required this.company});

  factory StoreCompanyRes.fromJson(Map<String, Object?> json) =>
      _$StoreCompanyResFromJson(json);

  final StoreCompany company;

  Map<String, Object?> toJson() => _$StoreCompanyResToJson(this);
}
