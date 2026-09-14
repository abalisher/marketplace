// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/admin_assembly_task_complete_res.dart';
import '../models/admin_assembly_task_list_res.dart';
import '../models/admin_assembly_task_res.dart';
import '../models/admin_complete_assembly_task.dart';
import '../models/admin_mark_assembly_item.dart';
import '../models/admin_order_assembly_res.dart';
import '../models/admin_shipping_queue_res.dart';
import '../models/stage.dart';

part 'assembly_client.g.dart';

@RestApi()
abstract class AssemblyClient {
  factory AssemblyClient(Dio dio, {String? baseUrl}) = _AssemblyClient;

  /// List Assembly Tasks.
  ///
  /// Очередь заданий сборки: оплаченный заказ распадается на задания по категориям (по одному на категорию). Один ресурс на два экрана — сборщик видит только задания своей группы (категория подставляется из его учётки и перекрывает параметр category), отгрузка видит все задания. Каждая запись несёт готовую строку экрана: заказ, категория, статус, позиции с отметками и сводка по ним.
  ///
  /// [status] - Фильтр по статусу задания. Одно значение или несколько через запятую («pending,picking»). Описан ПРОСТОЙ строкой, а не объединением «строка | массив»: из oneOf кодогенератор Dart делает параметр dynamic и зовёт у него toJson(), из-за чего очередь сборщика падала NoSuchMethodError ещё до запроса (найдено на совместном прогоне 2026-09-06).
  ///
  /// [category] - Категория-группа (handle категории каталога). У сборщика игнорируется — его группа берётся из учётки.
  ///
  /// [orderId] - Задания одного заказа.
  @GET('/admin/assembly-tasks')
  Future<AdminAssemblyTaskListRes> getAssemblyTasks({
    @Query('limit') int? limit = 20,
    @Query('offset') int? offset = 0,
    @Query('status') String? status,
    @Query('category') String? category,
    @Query('order_id') String? orderId,
  });

  /// Get Assembly Task.
  ///
  /// Карточка задания: позиции с количеством и отметками, заказ, статус.
  @GET('/admin/assembly-tasks/{id}')
  Future<AdminAssemblyTaskRes> getAssemblyTaskById({
    @Path('id') required String id,
  });

  /// Start Assembly Task.
  ///
  /// Сборщик взял задание в работу (ожидает → собирается). Исполнителем становится учётка запроса.
  @POST('/admin/assembly-tasks/{id}/start')
  Future<AdminAssemblyTaskRes> postAssemblyTaskStart({
    @Path('id') required String id,
  });

  /// Mark Assembly Item.
  ///
  /// Отметка сборщика по позиции задания: набрано целиком, набрано частично (сколько именно) или нет в наличии. В ответ приходит всё задание целиком.
  @POST('/admin/assembly-tasks/{id}/items/{item_id}')
  Future<AdminAssemblyTaskRes> postAssemblyTaskItemMark({
    @Path('id') required String id,
    @Path('item_id') required String itemId,
    @Body() required AdminMarkAssemblyItem body,
  });

  /// Complete Assembly Task.
  ///
  /// Сборщик закрыл задание. Итог выводится из отметок позиций: всё набрано — «собрано», иначе «нехватка». Когда закрыто последнее задание заказа, набранное уходит в отгрузку (fulfillment) и бизнес-статус заказа становится «собран» или «частично собран».
  @POST('/admin/assembly-tasks/{id}/complete')
  Future<AdminAssemblyTaskCompleteRes> postAssemblyTaskComplete({
    @Path('id') required String id,
    @Body() AdminCompleteAssemblyTask? body,
  });

  /// Get Order Assembly.
  ///
  /// Сборка одного заказа: задания по категориям со статусами и агрегат («заказ собран», где нехватка). База экрана отгрузки.
  @GET('/admin/orders/{id}/assembly')
  Future<AdminOrderAssemblyRes> getOrderAssembly({
    @Path('id') required String id,
  });

  /// List Shipping Queue.
  ///
  /// Рабочий стол отгрузки: заказы, которые ещё не уехали, — плитками категорий сборки, стадией («собирается» / «готов к отгрузке» / «нехватка») и готовой целью перехода «передать водителю». Стадия выводится из заданий сборки, а не из статуса заказа: жизненный цикл догоняет факт сборки только при закрытии последнего задания. Очередь просматривается до потолка scan_cap, страница режется в памяти — счётчики стадий при этом полные.
  ///
  /// [stage] - Фильтр по стадии заказа в очереди отгрузки.
  @GET('/admin/shipping-queue')
  Future<AdminShippingQueueRes> getShippingQueue({
    @Query('limit') int? limit = 20,
    @Query('offset') int? offset = 0,
    @Query('stage') Stage? stage,
  });
}
