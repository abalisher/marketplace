import 'package:core/auth/auth_controller.dart';
import 'package:core/config/app_config_provider.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/assistant/screens/chat_screen.dart';
import '../features/auth/screens/account_screen.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/phone_login_screen.dart';
import '../features/auth/screens/register_screen.dart';
import '../features/cart/screens/cart_screen.dart';
import '../features/company/screens/company_screen.dart';
import '../features/catalog/screens/catalog_screen.dart';
import '../features/catalog/screens/product_detail_screen.dart';
import '../features/checkout/screens/checkout_screen.dart';
import '../features/bonus/screens/bonus_screen.dart';
import '../features/estimator/screens/estimator_screen.dart';
import '../features/cabinet/screens/cabinet_cart_screen.dart';
import '../features/cabinet/screens/cabinet_documents_screen.dart';
import '../features/cabinet/screens/cabinet_orders_screen.dart';
import '../features/cabinet/screens/cabinet_profile_screen.dart';
import '../features/orders/screens/order_detail_screen.dart';

/// Префиксы защищённых маршрутов — требуют авторизации. Гость перенаправляется
/// на вход с сохранением цели в `?redirect=`. Каталог/товар/корзина публичны
/// (браузинг без входа); аккаунт/оформление/заказы/бонусы/компания — только для
/// авторизованного покупателя. Префиксное сравнение покрывает вложенные.
/// `/company` остаётся в списке: маршрут появляется вместе с флагом
/// FEATURE_COMPANIES (T10.9), а правило доступа к нему от флага не зависит.
const _protectedRoutes = {
  '/account',
  '/cabinet',
  '/checkout',
  '/orders',
  '/bonuses',
  '/company',
};

bool _isProtected(String location) {
  return _protectedRoutes.any(
    (prefix) => location == prefix || location.startsWith('$prefix/'),
  );
}

/// Провайдер роутера приложения покупателя. Гард (`redirect`) читает состояние
/// [authControllerProvider]; [ValueNotifier] будит роутер на смену авторизации
/// (вход/выход → пересчёт редиректа).
final routerProvider = Provider<GoRouter>((ref) {
  // Юрлица заморожены на MVP (T10.9): маршрута «Компания» нет вовсе, пока
  // FEATURE_COMPANIES выключен. Конфиг читается один раз — от сборки он не
  // меняется, перестраивать роутер не на что.
  final config = ref.read(appConfigProvider);
  final refresh = ValueNotifier<int>(0);
  ref.onDispose(refresh.dispose);
  ref.listen(authControllerProvider, (_, _) => refresh.value++);

  return GoRouter(
    // Стартовый экран после пивота — разговорный ассистент (главный путь
    // покупателя). Классические экраны каталога/корзины остаются доступны, но
    // уходят с активного пути (см. STATE.md, пивот 2026-07-22, решение №3).
    initialLocation: '/chat',
    refreshListenable: refresh,
    redirect: (context, state) {
      final auth = ref.read(authControllerProvider);
      // Пока сессия восстанавливается — не дёргаем редирект (иначе гость на
      // защищённом маршруте отскочит на вход до проверки токена).
      if (auth.isLoading) return null;

      final authed = auth.valueOrNull != null;
      final location = state.matchedLocation;
      final onAuthScreen =
          location.startsWith('/login') || location == '/register';

      if (!authed && _isProtected(location)) {
        final target = Uri.encodeComponent(state.uri.toString());
        return '/login?redirect=$target';
      }
      if (authed && onAuthScreen) {
        final target = state.uri.queryParameters['redirect'];
        return (target != null && target.isNotEmpty) ? target : '/';
      }
      return null;
    },
    routes: [
      GoRoute(path: '/chat', builder: (context, state) => const ChatScreen()),
      GoRoute(path: '/', builder: (context, state) => const CatalogScreen()),
      GoRoute(
        path: '/product/:id',
        builder: (context, state) =>
            ProductDetailScreen(productId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/cart', builder: (context, state) => const CartScreen()),
      GoRoute(
        path: '/estimator',
        builder: (context, state) => const EstimatorScreen(),
      ),
      GoRoute(
        path: '/checkout',
        builder: (context, state) => const CheckoutScreen(),
      ),
      // Основной вход — по номеру телефона (T10.7); вход по email оставлен
      // отдельным маршрутом для учёток, заведённых раньше.
      GoRoute(
        path: '/login',
        builder: (context, state) => const PhoneLoginScreen(),
      ),
      GoRoute(
        path: '/login/email',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/account',
        builder: (context, state) => const AccountScreen(),
      ),
      // Кабинет клиента (T10.6): заказы, корзина, документы и профиль рядом с
      // историей диалогов. Корень раздела ведёт в заказы — за ними сюда и
      // приходят.
      GoRoute(
        path: '/cabinet',
        redirect: (context, state) => '/cabinet/orders',
      ),
      GoRoute(
        path: '/cabinet/orders',
        builder: (context, state) => const CabinetOrdersScreen(),
      ),
      GoRoute(
        path: '/cabinet/orders/:id',
        builder: (context, state) =>
            OrderDetailScreen(orderId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/cabinet/cart',
        builder: (context, state) => const CabinetCartScreen(),
      ),
      GoRoute(
        path: '/cabinet/documents',
        builder: (context, state) => const CabinetDocumentsScreen(),
      ),
      GoRoute(
        path: '/cabinet/profile',
        builder: (context, state) => const CabinetProfileScreen(),
      ),
      // Старые адреса заказов: на них ведут ссылки из прошлых вставок ленты и
      // сохранённые переходы — уводим в кабинет, а не держим второй экран.
      GoRoute(path: '/orders', redirect: (context, state) => '/cabinet/orders'),
      GoRoute(
        path: '/orders/:id',
        redirect: (context, state) =>
            '/cabinet/orders/${state.pathParameters['id']}',
      ),
      GoRoute(
        path: '/bonuses',
        builder: (context, state) => const BonusScreen(),
      ),
      if (config.featureCompanies)
        GoRoute(
          path: '/company',
          builder: (context, state) => const CompanyScreen(),
        ),
    ],
  );
});
