// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/admin_dispute_res.dart';
import '../models/admin_disputes_list_res.dart';
import '../models/admin_disputes_res.dart';
import '../models/admin_moderate_review.dart';
import '../models/admin_review_res.dart';
import '../models/admin_review_summaries_res.dart';
import '../models/admin_reviews_res.dart';
import '../models/admin_transition_dispute.dart';
import '../models/status2.dart';
import '../models/store_create_review.dart';
import '../models/store_dispute_res.dart';
import '../models/store_disputes_res.dart';
import '../models/store_open_dispute.dart';
import '../models/store_review_res.dart';
import '../models/store_reviews_res.dart';

part 'reviews_client.g.dart';

@RestApi()
abstract class ReviewsClient {
  factory ReviewsClient(Dio dio, {String? baseUrl}) = _ReviewsClient;

  /// List Order Reviews (Admin).
  ///
  /// Все отзывы заказа (включая скрытые) для админа/продавца. Namespace /reviews не перекрывает ядровые /admin/orders/{id}/{cancel,complete}.
  @GET('/admin/orders/{id}/reviews')
  Future<AdminReviewsRes> adminGetOrdersIdReviews({
    @Path('id') required String id,
  });

  /// List Order Disputes (Admin).
  ///
  /// Диспуты заказа для админа/продавца (страница заказа).
  @GET('/admin/orders/{id}/disputes')
  Future<AdminDisputesRes> adminGetOrdersIdDisputes({
    @Path('id') required String id,
  });

  /// Rating Summary (Admin).
  ///
  /// Сводка рейтинга по объектам (поставщик/доставка): среднее и количество опубликованных отзывов.
  @GET('/admin/reviews/summary')
  Future<AdminReviewSummariesRes> adminGetReviewsSummary();

  /// Moderate Review.
  ///
  /// Скрыть/опубликовать отзыв (модерация видимости).
  @POST('/admin/reviews/{id}/moderate')
  Future<AdminReviewRes> adminPostReviewsIdModerate({
    @Path('id') required String id,
    @Body() required AdminModerateReview body,
  });

  /// List Dispute Queue.
  ///
  /// Очередь диспутов: фильтр по статусу (дефолт — активные open+in_review, FIFO), пагинация.
  @GET('/admin/disputes')
  Future<AdminDisputesListRes> adminGetDisputes({
    @Query('limit') int? limit = 20,
    @Query('offset') int? offset = 0,
    @Query('status') Status2? status,
  });

  /// Transition Dispute.
  ///
  /// Ведение диспута по стейт-машине (in_review/resolved/rejected). Недопустимый из текущего статуса переход → 400.
  @POST('/admin/disputes/{id}/transition')
  Future<AdminDisputeRes> adminPostDisputesIdTransition({
    @Path('id') required String id,
    @Body() required AdminTransitionDispute body,
  });

  /// List My Order Reviews.
  ///
  /// Отзывы текущего покупателя по заказу (поставщик/доставка раздельно). 404 — заказ не принадлежит покупателю.
  @GET('/store/orders/{id}/reviews')
  Future<StoreReviewsRes> getOrdersIdReviews({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Path('id') required String id,
  });

  /// Create Order Review.
  ///
  /// Оставить отзыв по заказу. Разрешено только для своего доставленного/закрытого заказа; target=delivery — только для способа delivery; один отзыв на (заказ, объект). 400 — гейт не пройден или дубль, 404 — чужой заказ.
  @POST('/store/orders/{id}/reviews')
  Future<StoreReviewRes> postOrdersIdReviews({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Path('id') required String id,
    @Body() required StoreCreateReview body,
  });

  /// List My Order Disputes.
  ///
  /// Диспуты текущего покупателя по заказу. 404 — заказ не принадлежит покупателю.
  @GET('/store/orders/{id}/disputes')
  Future<StoreDisputesRes> getOrdersIdDisputes({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Path('id') required String id,
  });

  /// Open Order Dispute.
  ///
  /// Открыть диспут «проблема с заказом» по своему заказу. Второй активный диспут по заказу запрещён (400). 404 — чужой заказ.
  @POST('/store/orders/{id}/disputes')
  Future<StoreDisputeRes> postOrdersIdDisputes({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Path('id') required String id,
    @Body() required StoreOpenDispute body,
  });
}
