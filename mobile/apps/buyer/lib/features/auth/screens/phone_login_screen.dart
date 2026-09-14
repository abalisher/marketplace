import 'dart:async';

import 'package:core/auth/auth_controller.dart';
import 'package:core/auth/auth_exception.dart';
import 'package:core/auth/phone_format.dart';
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

/// Основной вход покупателя — по номеру телефона (T10.7, решение владельца
/// 2026-08-25). Два шага на одном экране: номер → код из SMS. Канон номера,
/// срок жизни кода, лимит попыток и паузу «выслать снова» считает бэкенд —
/// экран только показывает его ответ. Вход по email остался второй ссылкой:
/// под ним работают учётки, заведённые раньше.
///
/// Пока нет SMS-провайдера, бэкенд отдаёт код в ответе (dev-канал) — экран
/// показывает его подсказкой, иначе на стенде войти было бы нельзя.
/// При успехе навигацию делает редирект роутера.
class PhoneLoginScreen extends ConsumerStatefulWidget {
  const PhoneLoginScreen({super.key});

  @override
  ConsumerState<PhoneLoginScreen> createState() => _PhoneLoginScreenState();
}

class _PhoneLoginScreenState extends ConsumerState<PhoneLoginScreen> {
  final _phoneFormKey = GlobalKey<FormState>();
  final _codeFormKey = GlobalKey<FormState>();
  final _phone = TextEditingController();
  final _code = TextEditingController();

  /// Канон номера от бэкенда — его показываем и им подтверждаем код.
  String? _canonicalPhone;
  String? _devCode;
  int _resendIn = 0;
  Timer? _timer;
  bool _submitting = false;

  @override
  void dispose() {
    _timer?.cancel();
    _phone.dispose();
    _code.dispose();
    super.dispose();
  }

  bool get _codeStep => _canonicalPhone != null;

  void _startResendTimer(int seconds) {
    _timer?.cancel();
    setState(() => _resendIn = seconds);
    if (seconds <= 0) return;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      setState(() {
        _resendIn = _resendIn <= 1 ? 0 : _resendIn - 1;
        if (_resendIn == 0) timer.cancel();
      });
    });
  }

  void _showError(Object error, Messages messages) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(content: Text(authErrorMessage(error, messages))),
      );
  }

  Future<void> _requestCode(Messages messages, {required String phone}) async {
    setState(() => _submitting = true);
    try {
      final request = await ref
          .read(authControllerProvider.notifier)
          .requestPhoneCode(phone);
      if (!mounted) return;
      setState(() {
        _canonicalPhone = request.phone;
        _devCode = request.devCode;
        _code.clear();
      });
      _startResendTimer(request.resendAfter);
    } catch (error) {
      if (!mounted) return;
      // Слишком частый запрос: бэкенд говорит, сколько ждать — заводим таймер.
      if (error is AuthException &&
          error.kind == AuthErrorKind.tooManyRequests &&
          error.retryAfter != null) {
        _startResendTimer(error.retryAfter!);
      }
      _showError(error, messages);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _submitPhone(Messages messages) async {
    if (!_phoneFormKey.currentState!.validate()) return;
    await _requestCode(messages, phone: _phone.text.trim());
  }

  Future<void> _submitCode(Messages messages) async {
    if (!_codeFormKey.currentState!.validate()) return;
    setState(() => _submitting = true);
    try {
      await ref
          .read(authControllerProvider.notifier)
          .signInWithPhoneCode(
            phone: _canonicalPhone!,
            code: _code.text.trim(),
          );
    } catch (error) {
      if (!mounted) return;
      // Код сгорел — подсказку из dev-канала убираем, нужен новый код.
      if (error is AuthException &&
          (error.kind == AuthErrorKind.codeExpired ||
              error.kind == AuthErrorKind.tooManyAttempts)) {
        setState(() {
          _devCode = null;
          _code.clear();
        });
      }
      _showError(error, messages);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _changePhone() {
    _timer?.cancel();
    setState(() {
      _canonicalPhone = null;
      _devCode = null;
      _resendIn = 0;
      _code.clear();
    });
  }

  /// Переход на вход по email с сохранением цели `?redirect=` (чтобы после
  /// входа покупатель попал туда же, куда его увёл гард).
  void _goToEmailLogin() {
    final redirect = GoRouterState.of(context).uri.queryParameters['redirect'];
    context.push(
      redirect != null && redirect.isNotEmpty
          ? '/login/email?redirect=${Uri.encodeComponent(redirect)}'
          : '/login/email',
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = ref.watch(messagesProvider);
    return Scaffold(
      appBar: AppBar(title: Text(t.account)),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          _GuestCard(
            title: t.guestModeTitle,
            description: t.guestModeDescription,
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(t.phoneLoginTitle, style: AppTypography.titleMedium),
          const SizedBox(height: AppSpacing.xs),
          Text(
            _codeStep
                ? t.codeSentTo(formatPhone(_canonicalPhone!))
                : t.phoneLoginSubtitle,
            style: AppTypography.bodyMedium.copyWith(
              color: AppColorTokens.of(context).inkSecondary,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          if (!_codeStep) ..._phoneStep(t) else ..._codeStepFields(t),
          const SizedBox(height: AppSpacing.lg),
          AppTextButton(
            label: t.emailLoginPrompt,
            onPressed: _submitting ? null : _goToEmailLogin,
          ),
        ],
      ),
    );
  }

  List<Widget> _phoneStep(Messages t) => [
    Form(
      key: _phoneFormKey,
      child: AppTextField(
        controller: _phone,
        label: t.phoneLabel,
        helperText: t.phoneNumberHint,
        keyboardType: TextInputType.phone,
        textInputAction: TextInputAction.done,
        enabled: !_submitting,
        validator: (value) => AuthValidators.phone(value, t),
        onFieldSubmitted: (_) => _submitPhone(t),
      ),
    ),
    const SizedBox(height: AppSpacing.lg),
    AppPrimaryButton(
      label: t.requestCodeButton,
      onPressed: _submitting ? null : () => _submitPhone(t),
    ),
  ];

  List<Widget> _codeStepFields(Messages t) => [
    Form(
      key: _codeFormKey,
      child: AppTextField(
        controller: _code,
        label: t.codeLabel,
        helperText: _devCode == null ? null : t.devCodeHint(_devCode!),
        keyboardType: TextInputType.number,
        textInputAction: TextInputAction.done,
        enabled: !_submitting,
        validator: (value) => AuthValidators.code(value, t),
        onFieldSubmitted: (_) => _submitCode(t),
      ),
    ),
    const SizedBox(height: AppSpacing.lg),
    AppPrimaryButton(
      label: t.signInButton,
      onPressed: _submitting ? null : () => _submitCode(t),
    ),
    const SizedBox(height: AppSpacing.xs),
    AppTextButton(
      label: _resendIn > 0 ? t.resendCodeIn(_resendIn) : t.resendCode,
      onPressed: _submitting || _resendIn > 0
          ? null
          : () => _requestCode(t, phone: _canonicalPhone!),
    ),
    AppTextButton(
      label: t.changePhone,
      onPressed: _submitting ? null : _changePhone,
    ),
  ];
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
