// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/store_company_employees_res.dart';
import '../models/store_company_me_res.dart';
import '../models/store_company_registration_res.dart';
import '../models/store_company_res.dart';
import '../models/store_create_company.dart';
import '../models/store_create_employee.dart';
import '../models/store_create_spend_limit.dart';
import '../models/store_employee_delete_res.dart';
import '../models/store_employee_res.dart';
import '../models/store_spend_limit_delete_res.dart';
import '../models/store_spend_limit_res.dart';
import '../models/store_update_company_application.dart';

part 'companies_client.g.dart';

@RestApi()
abstract class CompaniesClient {
  factory CompaniesClient(Dio dio, {String? baseUrl}) = _CompaniesClient;

  /// Register a Company.
  ///
  /// Регистрация юрлица текущим покупателем: компания создаётся в статусе pending, покупатель становится сотрудником-админом. Лимиты/отсрочка активируются после модерации.
  @POST('/store/companies')
  Future<StoreCompanyRegistrationRes> postCompanies({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreCreateCompany body,
  });

  /// Get My Company.
  ///
  /// Компания текущего покупателя и его роль в ней. 404 — покупатель не состоит в компании.
  @GET('/store/companies/me')
  Future<StoreCompanyMeRes> getCompaniesMe({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
  });

  /// Update My Company Application.
  ///
  /// Правка собственной заявки админом компании: исправить реквизиты после отказа модератора и/или догрузить учредительные документы (общий лимит на компанию — 4 файла). Отклонённая заявка возвращается в очередь модерации (rejected → pending, отметка resubmitted_at); реквизиты одобренной компании менять нельзя.
  @POST('/store/companies/me')
  Future<StoreCompanyRes> postCompaniesMe({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreUpdateCompanyApplication body,
  });

  /// List Company Employees.
  ///
  /// Сотрудники компании с данными customer и лимитами. Только для админа компании.
  @GET('/store/companies/me/employees')
  Future<StoreCompanyEmployeesRes> getCompaniesMeEmployees({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
  });

  /// Add Company Employee.
  ///
  /// Принять существующего customer в компанию. Только для админа компании.
  @POST('/store/companies/me/employees')
  Future<StoreEmployeeRes> postCompaniesMeEmployees({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreCreateEmployee body,
  });

  /// Remove Company Employee.
  ///
  /// Уволить сотрудника: снимается привязка к customer, лимиты удаляются. Только для админа компании; админ не может удалить сам себя.
  @DELETE('/store/companies/me/employees/{id}')
  Future<StoreEmployeeDeleteRes> deleteCompaniesMeEmployeesId({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Path('id') required String id,
  });

  /// Create Employee Spend Limit.
  ///
  /// Назначить сотруднику лимит на оформление заявок. У сотрудника может быть несколько лимитов с разными периодами. Только для админа компании.
  @POST('/store/companies/me/employees/{id}/spend-limits')
  Future<StoreSpendLimitRes> postCompaniesMeEmployeesIdSpendLimits({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Path('id') required String id,
    @Body() required StoreCreateSpendLimit body,
  });

  /// Delete Employee Spend Limit.
  ///
  /// Снять лимит с сотрудника. Только для админа компании.
  @DELETE('/store/companies/me/employees/{id}/spend-limits/{limit_id}')
  Future<StoreSpendLimitDeleteRes>
  deleteCompaniesMeEmployeesIdSpendLimitsLimitId({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Path('id') required String id,
    @Path('limit_id') required String limitId,
  });
}
