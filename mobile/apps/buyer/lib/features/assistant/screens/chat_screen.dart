import 'dart:async';

import 'package:core/auth/auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ui_kit/app_assistant_answer.dart';
import 'package:ui_kit/app_attachment_chip.dart';
import 'package:ui_kit/app_cart_bar.dart';
import 'package:ui_kit/app_chat_bubble.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_icon_button.dart';
import 'package:ui_kit/app_input_bar.dart';
import 'package:ui_kit/app_message_actions.dart';
import 'package:ui_kit/app_mic_button.dart';
import 'package:ui_kit/app_quantity_stepper.dart';
import 'package:ui_kit/app_radius.dart';
import 'package:ui_kit/app_recording_indicator.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_suggestion_chip.dart';
import 'package:ui_kit/app_typing_bubble.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/app_locale.dart';
import '../../../l10n/messages.dart';
import '../../../l10n/messages_provider.dart';
import '../../../shared/tenge.dart';
import '../domain/chat_attachment.dart';
import '../domain/chat_file_failure.dart';
import '../domain/chat_message.dart';
import '../domain/chat_role.dart';
import '../domain/chat_state.dart';
import '../domain/payment_status.dart';
import '../domain/voice_failure.dart';
import '../domain/voice_limits.dart';
import '../providers/assistant_cart_controller.dart';
import '../providers/chat_controller.dart';
import '../providers/chat_files_controller.dart';
import '../providers/payment_status_provider.dart';
import '../providers/voice_controller.dart';
import '../widgets/chat_attachment_view.dart';
import '../widgets/chat_drawer.dart';
import '../widgets/chat_file_source_sheet.dart';
import '../widgets/chat_files_view.dart';

/// Главный экран покупателя: разговорный ассистент. Оболочка — по брифу эталона
/// Gemini (`docs/qa/2026-08-27-T10.1-gemini-brief.md`, T10.1c): приветствие с
/// композером ПО ЦЕНТРУ, один столбец разговора (реплика покупателя — пузырь
/// справа, ответ ассистента — без пузыря с меткой-аватаром и рядом действий),
/// композер-пилюля с дисклеймером, рельс истории — drawer 312px.
///
/// Покупатель описывает задачу текстом — бэкенд подбирает материалы, собирает
/// корзину, оформляет доставку/оплату и отслеживает заказ. Экран только
/// отображает ленту (текст + read-only вставки) и статус хода; логика — в
/// контроллере/бэкенде.
class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _scroll = ScrollController();
  final _input = TextEditingController();

  /// Длина ленты на прошлый кадр (сообщения + «печатает…») — автоскролл
  /// дёргаем только на её рост, а не на каждый ребилд (локаль, баннер ошибки).
  int _lastFeedLength = 0;

  /// Корзина, за оплату которой мы уже продолжили диалог автоматически: реплика
  /// «Я оплатил» отправляется РОВНО ОДИН раз на корзину (замечание владельца на
  /// приёмке 2026-08-11: «статус оплачено, почему сессия автоматом не
  /// продолжила?» — поллинг только читал статус, ход диалога начинал человек).
  String? _autoContinuedCartId;

  /// Реплика «я вошёл» отправляется РОВНО ОДИН раз за экран: иначе повторный
  /// вход (или пересборка ленты) слал бы её снова.
  bool _autoContinuedLogin = false;

  @override
  void dispose() {
    _scroll.dispose();
    _input.dispose();
    super.dispose();
  }

  /// Был ли покупатель у низа ленты на прошлом кадре. В перевёрнутой ленте низ —
  /// это offset 0 (minScrollExtent), допуск 40px.
  bool get _atBottom {
    if (!_scroll.hasClients) return true;
    final position = _scroll.position;
    return position.pixels <= position.minScrollExtent + 40;
  }

  /// В перевёрнутой ленте низ — это offset 0 (minScrollExtent).
  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.jumpTo(_scroll.position.minScrollExtent);
      }
    });
  }

  /// Оплата подтвердилась (поллинг платёжной вставки) — продолжаем диалог сам:
  /// ассистент проверит платёж и оформит заказ. Реплика обычная, текстом — тот
  /// же протокол, что у тапа по карточке товара.
  void _listenPayment(ChatState state, Messages t) {
    final cartId = state.cartId;
    // Вставки живут у последнего ответа ассистента.
    final unpaid =
        state.messages.isNotEmpty &&
        state.messages.last.attachments.any(
          (a) => a is PaymentAttachment && !a.paid,
        );
    if (cartId == null || !unpaid || state.isSending) {
      return;
    }
    ref.listen<AsyncValue<PaymentStatus>>(paymentStatusProvider(cartId), (
      _,
      next,
    ) {
      if (next.valueOrNull != PaymentStatus.paid) {
        return;
      }
      if (_autoContinuedCartId == cartId) {
        return;
      }
      _autoContinuedCartId = cartId;
      ref.read(chatControllerProvider.notifier).send(t.paymentPaidReply);
    });
  }

  /// Покупатель вошёл по кнопке из ленты (T10.8) — продолжаем диалог сам:
  /// ассистент увидит профиль и попросит только недостающее. Без этого
  /// покупатель возвращался в чат и не понимал, что делать дальше. Смотрим
  /// СОСТОЯНИЕ входа, а не его смену: после входа роутер возвращает на `/chat`
  /// новым экраном, и события смены на нём уже не будет.
  void _continueAfterLogin(ChatState state, Messages t) {
    if (_autoContinuedLogin || state.isSending) {
      return;
    }
    final waitingLogin =
        state.messages.isNotEmpty &&
        state.messages.last.attachments.any((a) => a is AuthPromptAttachment);
    final loggedIn = ref.watch(authControllerProvider).valueOrNull != null;
    if (!waitingLogin || !loggedIn) {
      return;
    }
    _autoContinuedLogin = true;
    // Отправляем ПОСЛЕ кадра: send меняет состояние провайдера, а мы сейчас
    // внутри build.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) {
        return;
      }
      ref.read(chatControllerProvider.notifier).send(t.authPromptLoggedInReply);
    });
  }

  /// Отправка из композера: черновик очищается.
  void _sendFromComposer(String text) {
    final files = ref.read(chatFilesControllerProvider).files;
    _input.clear();
    // Набор вложений снимаем сразу: реплика и файлы ушли одним сообщением, и
    // остаться в композере они не должны — следующий ход их уже не увидит.
    ref.read(chatFilesControllerProvider.notifier).clear();
    ref.read(chatControllerProvider.notifier).send(text, files: files);
  }

  /// Скрепка: спрашиваем источник (камера / галерея / файл) и открываем
  /// системный путь. Лист закрыли, ничего не выбрав — молчим.
  Future<void> _pickFiles(Messages t) async {
    final source = await showChatFileSourceSheet(context, t);
    if (source == null) return;
    await ref.read(chatFilesControllerProvider.notifier).pick(source);
  }

  /// Текст отказа по вложению. Причины разные — и делать покупателю в каждом
  /// случае надо разное, поэтому одного «не получилось» мало.
  String _fileFailureText(Messages t, ChatFileFailure failure) {
    switch (failure) {
      case ChatFileFailure.denied:
        return t.filesFailureDenied;
      case ChatFileFailure.type:
        return t.filesFailureType;
      case ChatFileFailure.table:
        return t.filesFailureTable;
      case ChatFileFailure.tooLarge:
        return t.filesFailureTooLarge;
      case ChatFileFailure.turnTooLarge:
        return t.filesFailureTurnTooLarge;
      case ChatFileFailure.tooMany:
        return t.filesFailureTooMany;
      case ChatFileFailure.failed:
        return t.filesFailureFailed;
    }
  }

  /// Отправка чипа-примера: набранный черновик в композере не трогаем.
  void _sendExample(String text) {
    ref.read(chatControllerProvider.notifier).send(text);
  }

  /// Счётчик на карточке (или в полосе корзины) изменил количество: пишем в
  /// корзину напрямую, без хода модели (T10.15). Ассистент увидит новый состав
  /// снимком корзины на следующем ходе.
  void _changeQuantity({
    required String variantId,
    required String title,
    required int quantity,
  }) {
    ref
        .read(assistantCartControllerProvider.notifier)
        .setQuantity(variantId: variantId, title: title, quantity: quantity);
  }

  /// «Копировать» под ответом: текст ответа в буфер + тост подтверждения.
  void _copyAnswer(String text, Messages t) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(t.assistantTurnCopied)));
  }

  @override
  Widget build(BuildContext context) {
    final t = ref.watch(messagesProvider);
    final state = ref.watch(chatControllerProvider);
    final controller = ref.read(chatControllerProvider.notifier);

    final feedLength = state.messages.length + (state.isSending ? 1 : 0);
    // Печатающийся ответ растёт внутри ОДНОГО элемента ленты: длина не меняется,
    // поэтому к ней добавляем длину напечатанного — иначе лента не ехала бы
    // вниз, пока ответ печатается (T10.1d).
    final feedWeight = feedLength + state.streamingText.length;
    // Автопрокрутка только если покупатель УЖЕ был внизу: иначе он читает
    // старое, и рывок мешает (бриф §7).
    if (feedWeight > _lastFeedLength && _atBottom) _scrollToBottom();
    _lastFeedLength = feedWeight;

    final isEmpty = state.messages.isEmpty && !state.isSending;

    _listenPayment(state, t);
    _continueAfterLogin(state, t);

    return Scaffold(
      drawer: const ChatDrawer(),
      body: SafeArea(
        child: Column(
          children: [
            _Header(showDivider: !isEmpty),
            if (isEmpty)
              Expanded(child: _welcome(t, state))
            else ...[
              Expanded(child: _feed(t, state)),
              if (state.hasError) _errorBanner(t, controller),
              // Полоса корзины: карточки подбора уезжают вверх по ленте, а
              // править количество надо и после этого (T10.15).
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                child: _cartBar(t),
              ),
              _composer(t, state, welcome: false),
            ],
          ],
        ),
      ),
    );
  }

  /// Лента прижата к низу (макет 1b): ListView перевёрнут, элементы идут в
  /// обратном порядке — новые снизу, короткий диалог не «висит» сверху.
  /// Ответ ассистента — один блок [AppAssistantAnswer]: текст, вставки хода и
  /// ряд действий внутри него (бриф §3.4).
  Widget _feed(Messages t, ChatState state) {
    final items = <Widget>[];
    final lastIndex = state.messages.length - 1;
    for (var i = 0; i < state.messages.length; i++) {
      final m = state.messages[i];
      if (m.role == ChatRole.user) {
        final files = state.sentFiles[i];
        final hasFiles = files != null && files.isNotEmpty;
        items.add(
          AppChatBubble(
            // Реплика была ОДНИМ снимком, а превью живёт в памяти: в
            // возобновлённом из истории диалоге на его месте подпись —
            // пустой пузырь читался бы как сбой.
            text: m.content.isEmpty && !hasFiles
                ? t.filesSentPlaceholder
                : m.content,
            isUser: true,
            attachments: hasFiles ? ChatFilesView(files: files) : null,
          ),
        );
        continue;
      }
      items.add(_answer(t, state, message: m, isLast: i == lastIndex));
    }
    // Тихий след от счётчиков: покупатель нажал «+», корзина изменилась молча —
    // без отметки непонятно, сработало ли. Это отметка события, а не реплика:
    // ни пузыря, ни аватара, и в историю диалога она не идёт (T10.15).
    final colors = AppColorTokens.of(context);
    for (final event in ref.watch(assistantCartControllerProvider).events) {
      items.add(
        Padding(
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
          child: Text(
            event.quantity > 0
                ? t.cartEventAdded(event.title, event.quantity)
                : t.cartEventRemoved(event.title),
            style: AppTypography.caption.copyWith(color: colors.inkSecondary),
          ),
        ),
      );
    }
    if (state.isSending) {
      // До первой дельты — «печатает…», дальше растущий ответ на месте будущего
      // сообщения: без пузыря, с меткой-аватаром, но БЕЗ ряда действий —
      // копировать и повторять половину ответа нечего (T10.1d).
      items.add(
        state.streamingText.isEmpty
            ? AppTypingBubble(label: t.assistantTyping)
            : AppAssistantAnswer(
                text: state.streamingText,
                avatarMark: t.assistantLogoMark,
              ),
      );
    }

    return ListView(
      controller: _scroll,
      reverse: true,
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: items.reversed.toList(),
    );
  }

  /// Ответ ассистента без пузыря: метка-аватар, текст с лёгким markdown, наши
  /// вставки под текстом и ряд действий. «Повторить ответ» — только у
  /// последнего ответа (бриф §3.4) и только когда ход не идёт.
  Widget _answer(
    Messages t,
    ChatState state, {
    required ChatMessage message,
    required bool isLast,
  }) {
    final cart = ref.watch(assistantCartControllerProvider);
    final attachments = <Widget>[
      for (final a in message.attachments)
        ChatAttachmentView(
          attachment: a,
          cartId: state.cartId,
          orderId: state.orderId,
          quantities: cart.quantities,
          onQuantityChange: _changeQuantity,
        ),
      // Подсказка про счётчики — только под карточками свежего хода, чтобы не
      // повторять её по всей ленте.
      if (isLast && message.attachments.any((a) => a is ProductCardAttachment))
        _cartHint(t),
    ];
    final canRegenerate = isLast && !state.isSending && !state.hasError;
    return AppAssistantAnswer(
      text: message.content,
      avatarMark: t.assistantLogoMark,
      attachments: attachments,
      actions: AppMessageActions(
        copyLabel: t.assistantTurnCopy,
        onCopy: () => _copyAnswer(message.content, t),
        regenerateLabel: t.assistantTurnRegenerate,
        onRegenerate: canRegenerate
            ? ref.read(chatControllerProvider.notifier).regenerate
            : null,
      ),
    );
  }

  /// Полоса корзины над композером (T10.15): свёрнутая — итог, раскрытая — те
  /// же счётчики по позициям. Пустая корзина полосу не показывает.
  Widget _cartBar(Messages t) {
    final cart = ref.watch(assistantCartControllerProvider);
    if (cart.cart.isEmpty) return const SizedBox.shrink();
    return AppCartBar(
      title: t.cartTitle,
      count: cart.cart.items.length,
      total: formatTenge(cart.cart.total),
      expandLabel: t.cartExpand,
      collapseLabel: t.cartCollapse,
      errorText: cart.hasError ? t.cartError : null,
      lines: [
        for (final line in cart.cart.items)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        line.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTypography.bodyMedium.copyWith(
                          color: AppColorTokens.of(context).ink,
                        ),
                      ),
                      Text(
                        formatTenge(line.total),
                        style: AppTypography.caption.copyWith(
                          color: AppColorTokens.of(context).inkSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                AppQuantityStepper(
                  value: cart.quantities[line.variantId] ?? line.quantity,
                  enabled: !cart.isBusy,
                  addLabel: t.cartAdd,
                  increaseLabel: t.cartIncrease(line.title),
                  decreaseLabel: t.cartDecrease(line.title),
                  quantityLabel: t.cartQuantity(line.title),
                  onChanged: (next) => _changeQuantity(
                    variantId: line.variantId,
                    title: line.title,
                    quantity: next,
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  /// Подсказка под карточками подбора: количество набирают кнопками или словами.
  Widget _cartHint(Messages t) {
    final colors = AppColorTokens.of(context);
    return Text(
      t.attachmentCartHint,
      style: AppTypography.caption.copyWith(color: colors.inkSecondary),
    );
  }

  /// Приветственный экран (бриф §3.2): обращение, строка-пояснение, композер ПО
  /// ЦЕНТРУ — на приветствии он и есть главный объект экрана, — затем чипы
  /// подсказок и подпись о языках.
  Widget _welcome(Messages t, ChatState state) {
    final colors = AppColorTokens.of(context);
    // Center снаружи, скролл внутри: контент стоит по вертикальному центру,
    // пока влезает, и прокручивается на низких экранах (и с клавиатурой).
    return Center(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.xl,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 56,
                height: 56,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: colors.ink,
                  borderRadius: BorderRadius.circular(AppRadius.card),
                ),
                child: Text(
                  t.assistantLogoMark,
                  style: AppTypography.titleMediumBold.copyWith(
                    color: colors.surface,
                    letterSpacing: 0.7,
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.lg + AppSpacing.xs),
              Text(
                t.assistantGreeting,
                style: AppTypography.headingLarge.copyWith(color: colors.ink),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                t.assistantIntro,
                style: AppTypography.bodyLarge.copyWith(
                  color: colors.inkSecondary,
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              _composer(t, state, welcome: true),
              const SizedBox(height: AppSpacing.lg),
              for (final e in t.assistantExamples) ...[
                AppSuggestionChip(label: e, onTap: () => _sendExample(e)),
                const SizedBox(height: AppSpacing.sm),
              ],
              const SizedBox(height: AppSpacing.sm),
              Text(
                t.assistantLangNote,
                style: AppTypography.caption.copyWith(
                  color: colors.inkSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Расшифровка ДОПИСЫВАЕТСЯ к набранному, а не заменяет его: покупатель мог
  /// начать печатать и договорить голосом (T10.3). Курсор ставим в конец —
  /// правка до отправки и есть смысл этого пути.
  void _appendTranscript(String text) {
    final typed = _input.text.trim();
    _input.text = typed.isEmpty ? text : '$typed $text';
    _input.selection = TextSelection.collapsed(offset: _input.text.length);
  }

  /// Текст неудачи голосового ввода. Причины разные — и делать покупателю в
  /// каждом случае надо разное, поэтому одного «не получилось» мало.
  String _voiceFailureText(Messages t, VoiceFailure failure) {
    switch (failure) {
      case VoiceFailure.denied:
        return t.voiceFailureDenied;
      case VoiceFailure.failed:
        return t.voiceFailureFailed;
      case VoiceFailure.tooLarge:
        return t.voiceFailureTooLarge;
      case VoiceFailure.empty:
        return t.voiceFailureEmpty;
    }
  }

  /// Композер: пилюля [AppInputBar] и дисклеймер под ней (бриф §3.3). Поле НЕ
  /// блокируется на время хода — покупатель может печатать следующий вопрос,
  /// недоступна только отправка. На приветствии композер стоит в центре столбца
  /// ([welcome] = true) и отступов снизу не требует.
  ///
  /// Голосовой ввод (T10.3): микрофон перед кнопкой отправки, на время записи
  /// поле уступает место индикатору с таймером и рядом появляется отмена.
  /// Неудача говорит текстом на месте дисклеймера — молчащая кнопка микрофона
  /// худший из исходов.
  ///
  /// Вложения (T10.4c): скрепка слева, выбранные файлы — чипами НАД полем
  /// внутри той же пилюли (реплика и файлы уходят одним сообщением). Со
  /// вложением отправка разрешена и при пустом поле: снимок листа без подписи —
  /// нормальное сообщение.
  Widget _composer(Messages t, ChatState state, {required bool welcome}) {
    final colors = AppColorTokens.of(context);
    final voice = ref.watch(voiceControllerProvider);
    final voiceController = ref.read(voiceControllerProvider.notifier);
    final attachments = ref.watch(chatFilesControllerProvider);
    final attachmentsController = ref.read(
      chatFilesControllerProvider.notifier,
    );
    final composer = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AppInputBar(
          controller: _input,
          // Пока микрофон слушает или файл читается, отправлять нечего:
          // сообщение ещё диктуется, вложение ещё не прочитано.
          sendEnabled:
              !state.isSending && !voice.isBusy && !attachments.isPicking,
          allowEmpty: !attachments.isEmpty,
          hintText: welcome ? t.assistantHint : t.assistantHintActive,
          sendLabel: t.assistantSend,
          // Пока ответ печатается, на месте отправки стоит «Стоп» (T10.1d).
          onStop: ref.read(chatControllerProvider.notifier).stop,
          stopLabel: t.assistantStop,
          onSend: _sendFromComposer,
          fieldReplacement: voice.isBusy
              ? AppRecordingIndicator(
                  label: voice.isRecording
                      ? t.voiceRecording
                      : t.voiceTranscribing,
                  isRecording: voice.isRecording,
                  timer: voice.isRecording
                      ? '${voice.elapsed.inSeconds}/'
                            '${VoiceLimits.maxDuration.inSeconds}'
                      : null,
                )
              : null,
          above: attachments.isEmpty && !attachments.isPicking
              ? null
              : Wrap(
                  spacing: AppSpacing.sm,
                  runSpacing: AppSpacing.sm,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    for (final file in attachments.files)
                      AppAttachmentChip(
                        name: file.name,
                        bytes: file.bytes,
                        isImage: file.isImage,
                        removeLabel: t.filesRemove,
                        onRemove: () => attachmentsController.remove(file.id),
                      ),
                    if (attachments.isPicking)
                      Text(
                        t.filesReading,
                        style: AppTypography.bodyMedium.copyWith(
                          color: colors.inkSecondary,
                        ),
                      ),
                  ],
                ),
          // Скрепка. Во время голосовой записи её нет: поле уступило место
          // индикатору, и прикладывать файл к записи, которой ещё не
          // существует, некуда. Предел в три файла кнопку НЕ гасит —
          // покупатель узнаёт о нём строкой отказа, а не молчащей кнопкой.
          leading: voice.isBusy
              ? null
              : AppIconButton(
                  icon: Icons.attach_file_rounded,
                  label: t.filesAttach,
                  onTap: () => unawaited(_pickFiles(t)),
                ),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (voice.isBusy)
                AppIconButton(
                  icon: Icons.close_rounded,
                  label: t.voiceCancel,
                  onTap: () => unawaited(voiceController.cancel()),
                ),
              // Во время распознавания записывать заново нечего — кнопки нет.
              if (!voice.isTranscribing)
                AppMicButton(
                  isRecording: voice.isRecording,
                  label: voice.isRecording ? t.voiceFinish : t.voiceStart,
                  onTap: () => unawaited(
                    voice.isRecording
                        ? voiceController.stop()
                        : voiceController.start(onText: _appendTranscript),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        // Строка под композером одна, и очередь у неё такая: сначала голос,
        // потом вложения, потом дисклеймер — говорим о том, что покупатель
        // делал последним. Нажатие убирает строку и возвращает дисклеймер.
        if (voice.failure != null)
          GestureDetector(
            onTap: voiceController.dismissFailure,
            child: Text(
              _voiceFailureText(t, voice.failure!),
              textAlign: TextAlign.center,
              style: AppTypography.caption.copyWith(color: colors.error),
            ),
          )
        else if (attachments.failure != null)
          GestureDetector(
            onTap: attachmentsController.dismissFailure,
            child: Text(
              _fileFailureText(t, attachments.failure!),
              textAlign: TextAlign.center,
              style: AppTypography.caption.copyWith(color: colors.error),
            ),
          )
        else
          Text(
            t.assistantComposerDisclaimer,
            textAlign: TextAlign.center,
            style: AppTypography.caption.copyWith(color: colors.inkSecondary),
          ),
      ],
    );
    if (welcome) return composer;
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.md,
        AppSpacing.sm,
        AppSpacing.md,
        AppSpacing.sm,
      ),
      child: SafeArea(top: false, child: composer),
    );
  }

  Widget _errorBanner(Messages t, ChatController controller) {
    final colors = AppColorTokens.of(context);
    return Material(
      color: colors.error.withValues(alpha: 0.08),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.sm,
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                t.assistantError,
                style: AppTypography.bodyMedium.copyWith(color: colors.error),
              ),
            ),
            TextButton(onPressed: controller.retry, child: Text(t.retry)),
          ],
        ),
      ),
    );
  }
}

/// Шапка чата по макету (60px): меню (рельс истории), бренд с подзаголовком,
/// переключатель языка «Қаз/Рус» и вход в аккаунт. Разделитель снизу — только
/// в активном диалоге (1b), на приветственном экране шапка сливается с фоном.
class _Header extends ConsumerWidget {
  const _Header({required this.showDivider});

  final bool showDivider;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = ref.watch(messagesProvider);
    final colors = AppColorTokens.of(context);
    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
      decoration: BoxDecoration(
        border: showDivider
            ? Border(bottom: BorderSide(color: colors.border))
            : null,
      ),
      child: Row(
        children: [
          Builder(
            builder: (context) => IconButton(
              tooltip: t.assistantHistoryTooltip,
              icon: Icon(Icons.menu, color: colors.ink),
              onPressed: () => Scaffold.of(context).openDrawer(),
            ),
          ),
          const SizedBox(width: AppSpacing.xs),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  t.assistantTitle,
                  style: AppTypography.titleMedium.copyWith(
                    color: colors.ink,
                    height: 20 / 17,
                  ),
                ),
                Text(
                  t.assistantSubtitle,
                  style: AppTypography.overlineRegular.copyWith(
                    color: colors.inkSecondary,
                  ),
                ),
              ],
            ),
          ),
          const _LocaleSwitch(),
          IconButton(
            tooltip: t.account,
            icon: Icon(Icons.person_outline, color: colors.inkSecondary),
            onPressed: () => context.push('/account'),
          ),
        ],
      ),
    );
  }
}

/// Чип переключателя языка: показывает название другой локали («Қаз» ↔ «Рус»),
/// тап мгновенно переключает язык интерфейса. Тап-таргет ≥48dp вокруг чипа.
class _LocaleSwitch extends ConsumerWidget {
  const _LocaleSwitch();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = ref.watch(messagesProvider);
    final colors = AppColorTokens.of(context);
    return Semantics(
      button: true,
      label: t.localeSwitchHint,
      child: InkWell(
        onTap: () {
          final locale = ref.read(localeProvider);
          ref.read(localeProvider.notifier).state = switch (locale) {
            AppLocale.ru => AppLocale.kk,
            AppLocale.kk => AppLocale.ru,
          };
        },
        borderRadius: BorderRadius.circular(AppRadius.chip),
        child: Container(
          constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
          alignment: Alignment.center,
          child: Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.sm + 2,
              vertical: AppSpacing.xs + 2,
            ),
            decoration: BoxDecoration(
              color: colors.surface,
              borderRadius: BorderRadius.circular(AppRadius.chip),
              border: Border.all(color: colors.border),
            ),
            child: Text(
              t.localeSwitchLabel,
              style: AppTypography.bodyMediumSemibold.copyWith(
                color: colors.inkSecondary,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
