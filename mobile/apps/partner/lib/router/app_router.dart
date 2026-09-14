import 'package:core/auth/staff_auth_controller.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/assembly/screens/task_screen.dart';
import '../features/assembly/screens/tasks_screen.dart';
import '../features/auth/screens/staff_login_screen.dart';

/// Роутер приложения персонала. Экранов пока два (очередь заданий и само
/// задание) плюс вход: в приложении живёт одна роль — сборщик (решение
/// владельца по развилке №7: роль внутри `apps/partner`, а не четвёртое
/// приложение). Роли продавца и водителя добавятся сюда же своими ветками.
///
/// Гард простой и жёсткий: без сессии сотрудника доступен только `/login`.
/// Публичных экранов у складского приложения нет.
final routerProvider = Provider<GoRouter>((ref) {
  final refresh = ValueNotifier<int>(0);
  ref.onDispose(refresh.dispose);
  ref.listen(staffAuthControllerProvider, (_, _) => refresh.value++);

  return GoRouter(
    initialLocation: '/tasks',
    refreshListenable: refresh,
    redirect: (context, state) {
      final auth = ref.read(staffAuthControllerProvider);
      // Пока сессия восстанавливается — редирект не считаем, иначе вошедший
      // сборщик на старте отскочит на экран входа.
      if (auth.isLoading) return null;

      final authed = auth.valueOrNull != null;
      final onLogin = state.matchedLocation == '/login';
      if (!authed && !onLogin) return '/login';
      if (authed && onLogin) return '/tasks';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const StaffLoginScreen(),
      ),
      GoRoute(
        path: '/tasks',
        builder: (context, state) => const TasksScreen(),
        routes: [
          GoRoute(
            path: ':id',
            builder: (context, state) =>
                TaskScreen(taskId: state.pathParameters['id']!),
          ),
        ],
      ),
    ],
  );
});
