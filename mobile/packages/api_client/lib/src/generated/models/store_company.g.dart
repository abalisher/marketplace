// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_company.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCompany _$StoreCompanyFromJson(Map<String, dynamic> json) => StoreCompany(
  id: json['id'] as String,
  name: json['name'] as String,
  bin: json['bin'] as String,
  status: StoreCompanyStatus.fromJson(json['status'] as String),
  rejectionReason: json['rejection_reason'] as String?,
  documents: (json['documents'] as List<dynamic>?)
      ?.map((e) => StoreCompanyDocument.fromJson(e as Map<String, dynamic>))
      .toList(),
  resubmittedAt: json['resubmitted_at'] == null
      ? null
      : DateTime.parse(json['resubmitted_at'] as String),
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
  updatedAt: json['updated_at'] == null
      ? null
      : DateTime.parse(json['updated_at'] as String),
);

Map<String, dynamic> _$StoreCompanyToJson(StoreCompany instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'bin': instance.bin,
      'status': _$StoreCompanyStatusEnumMap[instance.status]!,
      'rejection_reason': ?instance.rejectionReason,
      'documents': ?instance.documents,
      'resubmitted_at': ?instance.resubmittedAt?.toIso8601String(),
      'created_at': ?instance.createdAt?.toIso8601String(),
      'updated_at': ?instance.updatedAt?.toIso8601String(),
    };

const _$StoreCompanyStatusEnumMap = {
  StoreCompanyStatus.pending: 'pending',
  StoreCompanyStatus.approved: 'approved',
  StoreCompanyStatus.rejected: 'rejected',
  StoreCompanyStatus.$unknown: r'$unknown',
};
