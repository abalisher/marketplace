import 'package:core/auth/auth_controller.dart';
import 'package:core/config/app_config_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_radius.dart';
import 'package:ui_kit/app_search_field.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages.dart';
import '../../../l10n/messages_provider.dart';
import '../../cabinet/domain/cabinet_section.dart';
import '../domain/chat_conversation.dart';
import '../providers/chat_controller.dart';
import '../providers/chat_history_controller.dart';
import 'chat_history_row.dart';

/// Рельс истории диалогов покупателя (бриф T10.1 §3.1, drawer 312px): «Новый
/// чат», поиск по истории (с порога [searchThreshold] диалогов), группа
/// «Недавние» со списком (тап — возобновить, «⋮» — переименовать/удалить),
/// низ — «Мои заказы» и аккаунт. История хранится на устройстве, бэкенд
/// stateless.
class ChatDrawer extends ConsumerStatefulWidget {
  const ChatDrawer({super.key});

  /// С какого числа диалогов показываем поиск (меньше — только шум, бриф §3.1).
  static const int searchThreshold = 5;

  /// Ширина панели по брифу (§5).
  static const double width = 312;

  @override
  ConsumerState<ChatDrawer> createState() => _ChatDrawerState();
}

class _ChatDrawerState extends ConsumerState<ChatDrawer> {
  final _search = TextEditingController();

  /// Текущий поисковый запрос по истории (пустой — фильтра нет).
  String _query = '';

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = ref.watch(messagesProvider);
    final colors = AppColorTokens.of(context);
    // Гость видит «Войти в аккаунт» акцентом (макет 1d), авторизованный — «Аккаунт».
    final authed = ref.watch(authControllerProvider).valueOrNull != null;
    final history = ref.watch(chatHistoryControllerProvider);
    final activeId = ref.watch(
      chatControllerProvider.select((s) => s.conversationId),
    );
    // Ошибку чтения истории показываем как пустую историю: диалоги —
    // вспомогательная навигация, ронять из-за них панель незачем.
    final conversations = history.valueOrNull ?? const <ChatConversation>[];
    final showSearch = conversations.length >= ChatDrawer.searchThreshold;
    final visible = conversations.where((c) => c.matches(_query)).toList();

    return Drawer(
      width: ChatDrawer.width,
      backgroundColor: colors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.horizontal(
          right: Radius.circular(AppRadius.bubble),
        ),
      ),
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.lg + 2,
                AppSpacing.lg,
                AppSpacing.sm + 2,
              ),
              child: Text(
                t.assistantTitle,
                style: AppTypography.titleMedium.copyWith(color: colors.ink),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              child: _NewChatButton(
                label: t.assistantRailNewChat,
                onTap: () {
                  ref.read(chatControllerProvider.notifier).reset();
                  Navigator.of(context).pop();
                },
              ),
            ),
            if (showSearch)
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.md,
                  AppSpacing.md,
                  AppSpacing.md,
                  0,
                ),
                child: AppSearchField(
                  controller: _search,
                  hintText: t.assistantRailSearchHint,
                  clearLabel: t.assistantRailSearchClear,
                  onChanged: (value) => setState(() => _query = value),
                ),
              ),
            if (conversations.isNotEmpty)
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  AppSpacing.md + 2,
                  AppSpacing.lg,
                  AppSpacing.xs,
                ),
                child: Text(
                  t.assistantRailRecent.toUpperCase(),
                  style: AppTypography.overline.copyWith(
                    color: colors.inkSecondary,
                  ),
                ),
              ),
            Expanded(
              child: _list(
                t: t,
                colors: colors,
                visible: visible,
                total: conversations.length,
                activeId: activeId,
              ),
            ),
            Container(
              decoration: BoxDecoration(
                border: Border(top: BorderSide(color: colors.border)),
              ),
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.md,
                AppSpacing.sm,
                AppSpacing.md,
                AppSpacing.md,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Кабинет клиента рядом с историей диалогов — метафора
                  // «проектов» эталона (T10.6). Раньше здесь была одна ссылка
                  // «Мои заказы»; теперь все четыре раздела, как на витрине.
                  for (final section in CabinetSection.values)
                    _DrawerLink(
                      icon: Icon(
                        _cabinetIcon(section),
                        size: 20,
                        color: colors.inkSecondary,
                      ),
                      label: Text(
                        _cabinetLabel(t, section),
                        style: AppTypography.bodyLargeMedium.copyWith(
                          color: colors.ink,
                        ),
                      ),
                      trailing: Icon(
                        Icons.chevron_right,
                        size: 18,
                        color: colors.inkSecondary,
                      ),
                      onTap: () {
                        Navigator.of(context).pop();
                        context.push(section.route);
                      },
                    ),
                  // Вход в раздел юрлица прямо из чата — как ссылка на
                  // «Компанию» в шапке чата витрины (T3.8). Гостя роутер
                  // уведёт на вход и вернёт сюда же. На MVP юрлица заморожены
                  // (T10.9) — пункт возвращает флаг FEATURE_COMPANIES.
                  if (ref.watch(appConfigProvider).featureCompanies)
                    _DrawerLink(
                      icon: Icon(
                        Icons.apartment_outlined,
                        size: 20,
                        color: colors.inkSecondary,
                      ),
                      label: Text(
                        t.companyTitle,
                        style: AppTypography.bodyLargeMedium.copyWith(
                          color: colors.ink,
                        ),
                      ),
                      trailing: Icon(
                        Icons.chevron_right,
                        size: 18,
                        color: colors.inkSecondary,
                      ),
                      onTap: () {
                        Navigator.of(context).pop();
                        context.push('/company');
                      },
                    ),
                  _DrawerLink(
                    icon: Container(
                      width: 30,
                      height: 30,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: colors.border, width: 1.6),
                      ),
                      child: Icon(
                        Icons.person_outline,
                        size: 16,
                        color: colors.inkSecondary,
                      ),
                    ),
                    label: Text(
                      authed ? t.account : t.assistantSignIn,
                      style:
                          (authed
                                  ? AppTypography.bodyLargeMedium
                                  : AppTypography.bodyLargeSemibold)
                              .copyWith(
                                color: authed ? colors.ink : colors.accent,
                              ),
                    ),
                    onTap: () {
                      Navigator.of(context).pop();
                      context.push('/account');
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Список диалогов: пустая история — заметка «здесь появятся ваши диалоги»,
  /// пустой результат поиска — «ничего не нашлось».
  Widget _list({
    required Messages t,
    required AppColorTokens colors,
    required List<ChatConversation> visible,
    required int total,
    required String? activeId,
  }) {
    if (total == 0) {
      return _note(t.assistantHistoryNote, colors);
    }
    if (visible.isEmpty) {
      return _note(t.assistantRailSearchEmpty, colors);
    }
    return ListView.builder(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      itemCount: visible.length,
      itemBuilder: (context, i) => ChatHistoryRow(
        conversation: visible[i],
        active: visible[i].id == activeId,
      ),
    );
  }

  /// Иконка раздела кабинета в панели.
  IconData _cabinetIcon(CabinetSection section) => switch (section) {
    CabinetSection.orders => Icons.inventory_2_outlined,
    CabinetSection.cart => Icons.shopping_cart_outlined,
    CabinetSection.documents => Icons.description_outlined,
    CabinetSection.profile => Icons.person_outline,
  };

  /// Подпись раздела кабинета в панели.
  String _cabinetLabel(Messages t, CabinetSection section) => switch (section) {
    CabinetSection.orders => t.cabinetNavOrders,
    CabinetSection.cart => t.cabinetNavCart,
    CabinetSection.documents => t.cabinetNavDocuments,
    CabinetSection.profile => t.cabinetNavProfile,
  };

  /// Заметка на месте списка (пустая история или пустой поиск).
  Widget _note(String text, AppColorTokens colors) => Padding(
    padding: const EdgeInsets.symmetric(
      horizontal: AppSpacing.lg,
      vertical: AppSpacing.sm,
    ),
    child: Align(
      alignment: Alignment.topLeft,
      child: Text(
        text,
        style: AppTypography.caption.copyWith(color: colors.inkSecondary),
      ),
    ),
  );
}

/// Кнопка «Новый чат» — плашка на контейнере акцента (макет 1d), иконка-карандаш
/// по брифу эталона.
class _NewChatButton extends StatelessWidget {
  const _NewChatButton({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Material(
      color: colors.accentContainer,
      borderRadius: BorderRadius.circular(AppRadius.chip + 4),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.chip + 4),
        child: Container(
          constraints: const BoxConstraints(minHeight: 48),
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          child: Row(
            children: [
              Icon(Icons.edit_outlined, size: 18, color: colors.accent),
              const SizedBox(width: AppSpacing.sm + 2),
              Text(
                label,
                style: AppTypography.button.copyWith(color: colors.accent),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Строка-переход в футере панели: иконка + подпись (+ шеврон), тап ≥48dp.
class _DrawerLink extends StatelessWidget {
  const _DrawerLink({
    required this.icon,
    required this.label,
    required this.onTap,
    this.trailing,
  });

  final Widget icon;
  final Widget label;
  final Widget? trailing;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.chip),
      child: Container(
        constraints: const BoxConstraints(minHeight: 48),
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
        child: Row(
          children: [
            icon,
            const SizedBox(width: AppSpacing.sm + 2),
            Expanded(child: label),
            ?trailing,
          ],
        ),
      ),
    );
  }
}
