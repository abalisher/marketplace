import 'package:core/auth/auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_primary_button.dart';
import 'package:ui_kit/app_radius.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_text_button.dart';
import 'package:ui_kit/app_text_field.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages.dart';
import '../../../l10n/messages_provider.dart';
import '../auth_error_message.dart';
import '../auth_validators.dart';

/// Экран 1e «аккаунт/вход» для гостя: карточка «вошли как гость» (что доступно
/// и зачем вход), форма входа email/пароль (auth-слой core; вариант (а) MVP —
/// SMS-развилка владельца ещё открыта, см. PLAN T2.6) и блок «для юрлиц» —
/// зачем регистрироваться. При успехе навигацию делает редирект роутера.
/// Собран только из ui_kit и токенов дизайн-системы.
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit(Messages messages) async {
    if (!_formKey.currentState!.validate()) return;
    final messenger = ScaffoldMessenger.of(context);
    setState(() => _submitting = true);
    try {
      await ref
          .read(authControllerProvider.notifier)
          .signIn(email: _email.text.trim(), password: _password.text);
    } catch (error) {
      messenger
        ..hideCurrentSnackBar()
        ..showSnackBar(
          SnackBar(content: Text(authErrorMessage(error, messages))),
        );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  /// Переход на регистрацию с сохранением цели `?redirect=` (чтобы после
  /// регистрации гость попал туда же, куда его увёл гард, а не на главную).
  void _goToRegister() {
    final redirect = GoRouterState.of(context).uri.queryParameters['redirect'];
    context.push(
      redirect != null && redirect.isNotEmpty
          ? '/register?redirect=${Uri.encodeComponent(redirect)}'
          : '/register',
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = ref.watch(messagesProvider);
    return Scaffold(
      appBar: AppBar(title: Text(t.account)),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
            _GuestCard(
              title: t.guestModeTitle,
              description: t.guestModeDescription,
            ),
            const SizedBox(height: AppSpacing.lg),
            AppTextField(
              controller: _email,
              label: t.emailLabel,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              enabled: !_submitting,
              validator: (value) => AuthValidators.email(value, t),
            ),
            const SizedBox(height: AppSpacing.md),
            AppTextField(
              controller: _password,
              label: t.passwordLabel,
              obscureText: true,
              textInputAction: TextInputAction.done,
              enabled: !_submitting,
              validator: (value) => AuthValidators.password(value, t),
              onFieldSubmitted: (_) => _submit(t),
            ),
            const SizedBox(height: AppSpacing.lg),
            AppPrimaryButton(
              label: t.signInButton,
              onPressed: _submitting ? null : () => _submit(t),
            ),
            const SizedBox(height: AppSpacing.xs),
            AppTextButton(
              label: t.noAccountPrompt,
              onPressed: _submitting ? null : _goToRegister,
            ),
            const SizedBox(height: AppSpacing.lg),
            _LegalEntityBlock(
              label: t.legalEntitySection,
              bullets: [
                t.legalEntityVat,
                t.legalEntityDocuments,
                t.legalEntityHistory,
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Карточка «вошли как гость» (макет 1e): аватар-иконка, заголовок, пояснение.
class _GuestCard extends StatelessWidget {
  const _GuestCard({required this.title, required this.description});

  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.lg + AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: colors.border),
      ),
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: colors.accentContainer,
            ),
            child: Icon(
              Icons.person_outline,
              size: 30,
              color: colors.inkSecondary,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            title,
            textAlign: TextAlign.center,
            style: AppTypography.titleMedium.copyWith(color: colors.ink),
          ),
          const SizedBox(height: AppSpacing.xs + 2),
          Text(
            description,
            textAlign: TextAlign.center,
            style: AppTypography.bodyMedium.copyWith(
              color: colors.inkSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

/// Блок «Для юридических лиц» (макет 1e): метка-оверлайн + список преимуществ
/// с маркерами-точками акцента.
class _LegalEntityBlock extends StatelessWidget {
  const _LegalEntityBlock({required this.label, required this.bullets});

  final String label;
  final List<String> bullets;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: AppTypography.overline.copyWith(color: colors.inkSecondary),
        ),
        const SizedBox(height: AppSpacing.sm),
        Container(
          decoration: BoxDecoration(
            color: colors.surface,
            borderRadius: BorderRadius.circular(AppRadius.card),
            border: Border.all(color: colors.border),
          ),
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          child: Column(
            children: [
              for (var i = 0; i < bullets.length; i++)
                Container(
                  constraints: const BoxConstraints(minHeight: 48),
                  decoration: BoxDecoration(
                    border: i == 0
                        ? null
                        : Border(top: BorderSide(color: colors.border)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: colors.accent,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Text(
                          bullets[i],
                          style: AppTypography.bodyMedium.copyWith(
                            color: colors.ink,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
