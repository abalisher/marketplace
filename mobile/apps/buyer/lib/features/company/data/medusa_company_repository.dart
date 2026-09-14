import 'dart:convert';

import 'package:api_client/api_client.dart'
    show
        MedusaStoreApi,
        StoreCompany,
        StoreCompanyStatus,
        StoreCreateCompany,
        StoreCreateCompanyFile,
        StoreCreateCompanyFileMimeType,
        StoreEmployee,
        StoreUpdateCompanyApplication;
import 'package:dio/dio.dart';

import '../domain/company.dart';
import '../domain/company_application_file.dart';
import '../domain/company_document.dart';
import '../domain/company_exception.dart';
import '../domain/company_membership.dart';
import '../domain/company_status.dart';
import 'company_repository.dart';

/// Реализация [CompanyRepository] поверх Medusa Store API
/// (`GET /store/companies/me`, `POST /store/companies`,
/// `POST /store/companies/me`).
class MedusaCompanyRepository implements CompanyRepository {
  MedusaCompanyRepository(this._api, this._publishableKey);

  final MedusaStoreApi _api;
  final String _publishableKey;

  @override
  Future<CompanyMembership?> fetchMyCompany() async {
    try {
      final response = await _api.companies.getCompaniesMe(
        xPublishableApiKey: _publishableKey,
      );
      return _toMembership(response.company, response.employee);
    } on DioException catch (error) {
      // 404 по контракту — «покупатель не состоит в компании»: это не ошибка,
      // а состояние «заявки ещё нет» (экран показывает форму).
      if (error.response?.statusCode == 404) return null;
      throw _mapError(error);
    }
  }

  @override
  Future<CompanyMembership> registerCompany({
    required String name,
    required String bin,
    required List<CompanyApplicationFile> files,
  }) async {
    try {
      final response = await _api.companies.postCompanies(
        xPublishableApiKey: _publishableKey,
        body: StoreCreateCompany(
          name: name,
          bin: bin,
          files: files.isEmpty ? null : files.map(_toFile).toList(),
        ),
      );
      return _toMembership(response.company, response.employee);
    } on DioException catch (error) {
      throw _mapError(error);
    }
  }

  @override
  Future<Company> updateApplication({
    String? name,
    String? bin,
    required List<CompanyApplicationFile> files,
  }) async {
    try {
      final response = await _api.companies.postCompaniesMe(
        xPublishableApiKey: _publishableKey,
        body: StoreUpdateCompanyApplication(
          name: name,
          bin: bin,
          files: files.isEmpty ? null : files.map(_toFile).toList(),
        ),
      );
      return _toCompany(response.company);
    } on DioException catch (error) {
      throw _mapError(error);
    }
  }

  StoreCreateCompanyFile _toFile(CompanyApplicationFile file) {
    return StoreCreateCompanyFile(
      name: file.name,
      mimeType: StoreCreateCompanyFileMimeType.fromJson(file.mimeType),
      contentBase64: base64Encode(file.bytes),
    );
  }

  CompanyMembership _toMembership(
    StoreCompany company,
    StoreEmployee employee,
  ) {
    return CompanyMembership(
      company: _toCompany(company),
      // Роль сериализуется в свой код (admin/member); держим строкой и
      // переводим словарём локали.
      role: employee.role.json ?? '',
    );
  }

  Company _toCompany(StoreCompany company) {
    return Company(
      name: company.name,
      bin: company.bin,
      status: _toStatus(company.status),
      rejectionReason: company.rejectionReason,
      documents: [
        for (final document in company.documents ?? const [])
          CompanyDocument(name: document.name, url: document.url),
      ],
      createdAt: company.createdAt,
      resubmittedAt: company.resubmittedAt,
    );
  }

  CompanyStatus _toStatus(StoreCompanyStatus status) {
    return switch (status) {
      StoreCompanyStatus.pending => CompanyStatus.pending,
      StoreCompanyStatus.approved => CompanyStatus.approved,
      StoreCompanyStatus.rejected => CompanyStatus.rejected,
      StoreCompanyStatus.$unknown => CompanyStatus.unknown,
    };
  }

  CompanyException _mapError(DioException error) {
    const networkTypes = {
      DioExceptionType.connectionError,
      DioExceptionType.connectionTimeout,
      DioExceptionType.receiveTimeout,
      DioExceptionType.sendTimeout,
    };
    final status = error.response?.statusCode ?? 0;
    if (status >= 400 && status < 500) {
      return const CompanyException(CompanyErrorKind.rejected);
    }
    return CompanyException(
      networkTypes.contains(error.type)
          ? CompanyErrorKind.network
          : CompanyErrorKind.unknown,
    );
  }
}
