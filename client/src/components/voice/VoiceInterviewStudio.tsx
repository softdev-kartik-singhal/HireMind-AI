'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mic,
  MicOff,
  Square,
  Pause,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Volume2,
  ShieldCheck,
  Edit3,
  Flame,
  Check,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { VoiceApi } from '@/lib/api-voice';
import {
  RecordingState,
  CommunicationMetrics,
  VoiceSubmissionResult,
} from '@/types/voice';
import { InterviewQuestion } from '@/types/interview';

interface Props {
  question: InterviewQuestion;
  interviewId: string;
  initialTranscript?: string;
  onResponseSubmitted?: (result: VoiceSubmissionResult) => void;
  className?: string;
}

export function VoiceInterviewStudio({
  question,
  interviewId,
  initialTranscript = '',
  onResponseSubmitted,
  className = '',
}: Props) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Audio & MediaRecorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Timer & Duration
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Transcript & Review
  const [transcript, setTranscript] = useState<string>(initialTranscript);
  const [metrics, setMetrics] = useState<CommunicationMetrics | null>(null);
  const [isEditingTranscript, setIsEditingTranscript] = useState<boolean>(false);

  // Auto-advance countdown
  const [autoAdvanceSeconds, setAutoAdvanceSeconds] = useState<number | null>(null);
  const autoAdvanceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { success, error: toastError, warning } = useToast();

  // Reset state when question changes
  useEffect(() => {
    setRecordingState('idle');
    setTranscript(initialTranscript);
    setMetrics(null);
    setDurationSeconds(0);
    setAutoAdvanceSeconds(null);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (autoAdvanceIntervalRef.current) clearInterval(autoAdvanceIntervalRef.current);
  }, [question.id, initialTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    const timer = timerIntervalRef.current;
    const autoAdvance = autoAdvanceIntervalRef.current;
    const animFrame = animationFrameRef.current;
    const audioCtx = audioContextRef.current;

    return () => {
      if (timer) clearInterval(timer);
      if (autoAdvance) clearInterval(autoAdvance);
      if (animFrame) cancelAnimationFrame(animFrame);
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
      }
    };
  }, []);

  // Visualizer drawing loop
  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / 32) * 0.75;
      const gap = (canvas.width / 32) * 0.25;
      let x = 0;

      for (let i = 0; i < 32; i++) {
        // Average frequency band
        const index = Math.floor((i * bufferLength) / 32);
        const value = dataArray[index] || 0;
        const percent = value / 255;
        const barHeight = Math.max(4, percent * canvas.height * 0.9);

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#6366f1'); // Indigo
        gradient.addColorStop(0.5, '#a855f7'); // Purple
        gradient.addColorStop(1, '#ec4899'); // Pink

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(
          x,
          (canvas.height - barHeight) / 2,
          barWidth,
          barHeight,
          barWidth / 2
        );
        ctx.fill();

        x += barWidth + gap;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  }, []);

  // 1. Request Microphone & Start Recording
  const startRecording = async () => {
    try {
      setPermissionError(null);
      setRecordingState('requesting_permission');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone audio recording is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setHasMicPermission(true);

      // Set up Web Audio Analyser
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Select supported MIME type
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = '';
          }
        }
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });

        await handleTranscribeAudio(audioBlob);
      };

      recorder.start(500); // 500ms chunks
      mediaRecorderRef.current = recorder;
      setRecordingState('recording');
      setDurationSeconds(0);

      // Timer
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);

      // Start Visualizer
      drawWaveform();
    } catch (err: any) {
      console.error('Failed to start audio recording:', err);
      setRecordingState('error');
      setHasMicPermission(false);
      const msg =
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Microphone access was denied. Please allow microphone permissions in your browser address bar to record verbal responses.'
          : err.message || 'Failed to initialize microphone.';
      setPermissionError(msg);
      toastError(msg);
    }
  };

  // 2. Pause / Resume Recording
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    } else if (recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
      timerIntervalRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  // 3. Stop Recording
  const stopRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    if (
      mediaRecorderRef.current &&
      (recordingState === 'recording' || recordingState === 'paused')
    ) {
      setRecordingState('transcribing');
      mediaRecorderRef.current.stop();
    }
  };

  // 4. Send to Speech-to-Text
  const handleTranscribeAudio = async (audioBlob: Blob) => {
    try {
      setRecordingState('transcribing');
      const response = await VoiceApi.transcribeAudio(audioBlob, question.id);

      setTranscript(response.transcript);
      setMetrics(response.metrics);
      setRecordingState('reviewing');
      success('Verbal answer transcribed successfully!');
    } catch (err: any) {
      console.error('Transcription error:', err);
      setRecordingState('error');
      toastError(
        err.response?.data?.message ||
          'Failed to transcribe audio. You can retry recording or enter written notes.'
      );
    }
  };

  // 5. Submit Final Voice Response
  const handleSubmitVoiceAnswer = async () => {
    if (!transcript.trim()) {
      warning('Transcript is empty. Please record or type an answer.');
      return;
    }

    try {
      setRecordingState('submitting');
      const result = await VoiceApi.submitVoiceResponse({
        interviewId,
        questionId: question.id,
        transcript: transcript.trim(),
        durationSeconds,
      });

      setMetrics(result.metrics);
      setRecordingState('submitted');
      success(
        `Voice response recorded! Relevance score: ${result.metrics.answerRelevanceScore}%`
      );

      if (onResponseSubmitted) {
        onResponseSubmitted(result);
      }
    } catch (err: any) {
      console.error('Failed to submit voice response:', err);
      setRecordingState('reviewing');
      toastError(err.response?.data?.message || 'Failed to submit voice response');
    }
  };

  // 6. Reset & Re-record
  const handleReset = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (autoAdvanceIntervalRef.current) clearInterval(autoAdvanceIntervalRef.current);
    if (
      mediaRecorderRef.current &&
      (recordingState === 'recording' || recordingState === 'paused')
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }
    setRecordingState('idle');
    setTranscript('');
    setMetrics(null);
    setDurationSeconds(0);
    setIsEditingTranscript(false);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto ${className}`}
    >
      {/* Privacy Notice Banner */}
      <div className="px-6 py-2.5 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            <strong>Microphone Privacy:</strong> Audio is processed strictly for technical
            transcription & relevance evaluation. We strictly do <em>not</em> profile emotion or
            psychology.
          </span>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hidden sm:inline-flex"
        >
          Secure STT Isolation
        </Badge>
      </div>

      {/* Main Studio Body */}
      <div className="flex-1 p-6 max-w-4xl w-full mx-auto flex flex-col space-y-6">
        {/* Permission Denied Alert */}
        {permissionError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-xs">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Microphone Access Required</strong>
              <p className="mt-0.5 leading-relaxed">{permissionError}</p>
            </div>
          </div>
        )}

        {/* Central Audio Capture Capsule */}
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/90 shadow-2xl flex flex-col items-center justify-center space-y-6 text-center relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div
            className={`absolute w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
              recordingState === 'recording'
                ? 'bg-rose-500/20 scale-125 animate-pulse'
                : recordingState === 'transcribing'
                ? 'bg-indigo-500/20 scale-110 animate-spin'
                : 'bg-indigo-500/10 scale-100'
            }`}
          />

          {/* Question Summary Badge */}
          <div className="flex items-center space-x-2 z-10">
            <Badge
              variant="outline"
              className="text-xs font-mono text-indigo-300 border-indigo-500/30 bg-indigo-950/40"
            >
              Question {question.orderIndex || 1} • {question.category}
            </Badge>
            <span className="text-xs text-slate-400">
              Recommended: 60s – 180s response
            </span>
          </div>

          <h3 className="text-xl font-bold text-white max-w-xl z-10 tracking-tight">
            {question.title}
          </h3>

          {/* Sound Waveform Canvas */}
          <div className="w-full max-w-md h-20 flex items-center justify-center z-10">
            {recordingState === 'recording' || recordingState === 'paused' ? (
              <canvas
                ref={canvasRef}
                width={400}
                height={80}
                className="w-full h-full"
              />
            ) : recordingState === 'transcribing' ? (
              <div className="flex flex-col items-center space-y-2 text-indigo-400 animate-pulse">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <span className="text-xs font-semibold">Transcribing speech & analyzing topics...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-1 opacity-30">
                {[4, 10, 16, 24, 18, 30, 20, 12, 6, 14, 28, 16, 8, 4].map(
                  (h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}px` }}
                      className="w-1.5 rounded-full bg-slate-500"
                    />
                  )
                )}
              </div>
            )}
          </div>

          {/* Timer Display */}
          <div className="flex items-center space-x-2 font-mono text-2xl font-bold text-white z-10">
            <Clock
              className={`w-6 h-6 ${
                recordingState === 'recording'
                  ? 'text-rose-400 animate-pulse'
                  : 'text-slate-400'
              }`}
            />
            <span>{formatTimer(durationSeconds)}</span>
          </div>

          {/* Primary Action Controls */}
          <div className="flex items-center space-x-4 z-10">
            {recordingState === 'idle' && (
              <Button
                size="lg"
                onClick={startRecording}
                className="bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold px-8 h-14 rounded-2xl shadow-xl shadow-rose-600/30 gap-2.5 text-sm"
              >
                <Mic className="w-5 h-5" />
                <span>Start Speaking</span>
              </Button>
            )}

            {recordingState === 'recording' && (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={togglePause}
                  className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700 h-13 rounded-2xl gap-2"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </Button>

                <Button
                  size="lg"
                  onClick={stopRecording}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-rose-400 font-bold px-8 h-13 rounded-2xl shadow-lg gap-2"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Finish & Transcribe</span>
                </Button>
              </>
            )}

            {recordingState === 'paused' && (
              <>
                <Button
                  size="lg"
                  onClick={togglePause}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-13 rounded-2xl gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume</span>
                </Button>

                <Button
                  size="lg"
                  onClick={stopRecording}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-rose-400 font-bold px-8 h-13 rounded-2xl shadow-lg gap-2"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Finish & Transcribe</span>
                </Button>
              </>
            )}

            {(recordingState === 'reviewing' ||
              recordingState === 'submitted' ||
              recordingState === 'error') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 h-10 rounded-xl gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Record Again</span>
              </Button>
            )}
          </div>
        </div>

        {/* Transcript Review & Editable Container */}
        {transcript && (
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">Transcribed Oral Response</h4>
                <Badge variant="outline" className="text-[10px] text-slate-400 font-mono">
                  {transcript.split(/\s+/).filter(Boolean).length} words
                </Badge>
              </div>

              <button
                onClick={() => setIsEditingTranscript((prev) => !prev)}
                className="flex items-center space-x-1 text-xs text-indigo-300 hover:text-white transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingTranscript ? 'Done Editing' : 'Edit Transcript'}</span>
              </button>
            </div>

            {isEditingTranscript ? (
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={5}
                className="w-full p-4 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-200 leading-relaxed font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                {transcript}
              </div>
            )}

            {/* Communication Metrics Cards */}
            {metrics && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Speaking Pace */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Speaking Pace
                    </span>
                    <span className="text-lg font-extrabold text-white mt-0.5 block">
                      {metrics.wordsPerMinute} <span className="text-xs font-normal text-slate-400">WPM</span>
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] mt-1 ${
                        metrics.paceRating === 'OPTIMAL'
                          ? 'text-emerald-300 border-emerald-500/30'
                          : 'text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {metrics.paceRating}
                    </Badge>
                  </div>

                  {/* Filler Words */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Filler Words
                    </span>
                    <span className="text-lg font-extrabold text-indigo-300 mt-0.5 block">
                      {metrics.fillerWordCount}{' '}
                      <span className="text-xs font-normal text-slate-400">
                        ({metrics.fillerPercentage}%)
                      </span>
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[9px] mt-1 text-slate-300 border-slate-700"
                    >
                      {metrics.fillerCategory}
                    </Badge>
                  </div>

                  {/* Topic Relevance */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Topic Relevance
                    </span>
                    <span className="text-lg font-extrabold text-emerald-400 mt-0.5 block">
                      {metrics.answerRelevanceScore}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {metrics.matchedTopics.length} topics covered
                    </span>
                  </div>

                  {/* Response Completeness */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Completeness
                    </span>
                    <span className="text-lg font-extrabold text-purple-300 mt-0.5 block">
                      {metrics.responseCompletenessScore}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Depth & structure
                    </span>
                  </div>
                </div>

                {/* Covered & Missing Topics */}
                {question.expectedTopics && question.expectedTopics.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2 text-xs">
                    <span className="font-semibold text-slate-300 block">
                      Technical Concept Coverage:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {metrics.matchedTopics.map((topic, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{topic}</span>
                        </span>
                      ))}
                      {metrics.missingTopics.map((topic, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700"
                        >
                          {topic} (not mentioned)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filler Words Breakdown */}
                {metrics.fillerBreakdown.length > 0 && (
                  <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                    <span>Filler words detected:</span>
                    <div className="flex gap-1.5">
                      {metrics.fillerBreakdown.map((item, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]"
                        >
                          &ldquo;{item.word}&rdquo;: {item.count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Objective Guardrail Disclaimer */}
                <p className="text-[10px] text-slate-500 italic leading-relaxed pt-1">
                  {metrics.disclaimer}
                </p>
              </div>
            )}

            {/* Final Submission Button */}
            {recordingState !== 'submitted' && (
              <div className="pt-3 flex justify-end">
                <Button
                  onClick={handleSubmitVoiceAnswer}
                  disabled={recordingState === 'submitting'}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-6 h-10 rounded-xl shadow-lg shadow-indigo-600/25 gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {recordingState === 'submitting'
                      ? 'Submitting Answer...'
                      : 'Submit Voice Answer'}
                  </span>
                </Button>
              </div>
            )}

            {recordingState === 'submitted' && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center space-x-2 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>Response submitted and stored in your interview transcript.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VoiceInterviewStudio;
