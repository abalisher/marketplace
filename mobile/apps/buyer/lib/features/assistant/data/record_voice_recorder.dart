import 'dart:async';
import 'dart:typed_data';

import 'package:record/record.dart';

import '../domain/voice_failure.dart';
import '../domain/voice_limits.dart';
import '../domain/voice_recording.dart';
import 'voice_exception.dart';
import 'voice_recorder.dart';
import 'wav_pcm16.dart';

/// Частота записи: 16 кГц моно — стандарт распознавания речи. Больше модели не
/// нужно, а минута такой записи весит ~1,9 МБ и укладывается в предел 8 МБ.
const _sampleRate = 16000;
const _numChannels = 1;

/// Запись голоса поверх плагина `record` (T10.3).
///
/// Пишем ПОТОКОМ сэмплов (`startStream`, PCM16), а не файлом: один путь на
/// Android, iOS и вебе — ни временных файлов, ни blob-URL, ни условных
/// импортов. Контейнер клеим сами ([wavFromPcm16]) — WAV единственный формат,
/// проверенный живьём против Gemini на прогоне T10.2.
///
/// Частоту устройство может поправить под себя (`setOnConfigChanged`) — тогда в
/// заголовок WAV идёт РЕАЛЬНАЯ частота, иначе речь звучала бы замедленной и
/// распозналась бы мусором.
class RecordVoiceRecorder implements VoiceRecorder {
  RecordVoiceRecorder({AudioRecorder? recorder})
    : _recorder = recorder ?? AudioRecorder();

  final AudioRecorder _recorder;

  StreamSubscription<Uint8List>? _subscription;
  final List<int> _samples = [];
  int _effectiveSampleRate = _sampleRate;
  int _effectiveChannels = _numChannels;
  DateTime? _startedAt;

  /// Запись перевалила за 8 МБ: дописывать смысла нет, отдаём причину на стопе.
  bool _overflowed = false;

  /// Поток записи упал посреди дороги (микрофон отобрали, вкладку увели).
  bool _broken = false;

  @override
  Future<void> start() async {
    _reset();
    // hasPermission сам показывает системный запрос — отдельный
    // permission_handler не нужен ни на одной из платформ.
    final granted = await _ask();
    if (!granted) {
      throw const VoiceException(VoiceFailure.denied);
    }
    _effectiveSampleRate = _sampleRate;
    _effectiveChannels = _numChannels;
    Stream<Uint8List> stream;
    try {
      await _recorder.setOnConfigChanged((config) {
        _effectiveSampleRate = config.sampleRate;
        _effectiveChannels = config.numChannels;
      });
      stream = await _recorder.startStream(
        const RecordConfig(
          encoder: AudioEncoder.pcm16bits,
          sampleRate: _sampleRate,
          numChannels: _numChannels,
          // Речь в помещении и на стройке: подавление шума и эха работает на
          // распознавание, а не против него.
          echoCancel: true,
          noiseSuppress: true,
        ),
      );
    } catch (_) {
      // Микрофона нет, он занят другим приложением, платформа не тянет поток.
      throw const VoiceException(VoiceFailure.failed);
    }
    _startedAt = DateTime.now();
    _subscription = stream.listen(
      (chunk) {
        if (_overflowed) return;
        if (_samples.length + chunk.length > VoiceLimits.maxBytes) {
          _overflowed = true;
          return;
        }
        _samples.addAll(chunk);
      },
      // Ошибку потока не роняем в зону — она всплывёт причиной на стопе.
      onError: (_) => _broken = true,
      cancelOnError: false,
    );
  }

  @override
  Future<VoiceRecording?> stop() async {
    final startedAt = _startedAt;
    try {
      await _recorder.stop();
    } catch (_) {
      // Остановка уже произошла (устройство прервало запись) — важно, что
      // собранные сэмплы у нас на руках.
    }
    // Поток закрывается вслед за stop: хвост сэмплов приходит уже после вызова,
    // поэтому подписку снимаем ПОСЛЕ, а не до.
    await _subscription?.cancel();
    _subscription = null;
    _startedAt = null;
    if (_overflowed) {
      _reset();
      throw const VoiceException(VoiceFailure.tooLarge);
    }
    if (_broken) {
      _reset();
      throw const VoiceException(VoiceFailure.failed);
    }
    if (_samples.isEmpty) {
      return null;
    }
    final wav = wavFromPcm16(
      pcmBytes: _samples,
      sampleRate: _effectiveSampleRate,
      numChannels: _effectiveChannels,
    );
    _samples.clear();
    // Длительность считаем по часам, а не по числу сэмплов: устройство могло
    // отдать не всё, а бэкенду нужна честная длина (предел 60 с — по ней).
    final elapsed = startedAt == null
        ? Duration.zero
        : DateTime.now().difference(startedAt);
    return VoiceRecording(
      mimeType: 'audio/wav',
      bytes: wav,
      duration: elapsed > VoiceLimits.maxDuration
          ? VoiceLimits.maxDuration
          : elapsed,
    );
  }

  @override
  Future<void> cancel() async {
    await _subscription?.cancel();
    _subscription = null;
    try {
      await _recorder.cancel();
    } catch (_) {
      // Записи и не было — гасить нечего.
    }
    _reset();
  }

  @override
  Future<void> dispose() async {
    await _subscription?.cancel();
    _subscription = null;
    await _recorder.dispose();
  }

  Future<bool> _ask() async {
    try {
      return await _recorder.hasPermission();
    } catch (_) {
      // На вебе без https микрофона просто нет — это тот же отказ в доступе.
      return false;
    }
  }

  void _reset() {
    _samples.clear();
    _overflowed = false;
    _broken = false;
    _startedAt = null;
  }
}
