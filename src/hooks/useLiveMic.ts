import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { transcribeAudio } from "@/lib/ai.functions";

const SILENCE_MS = 1400;
const SPEECH_THRESHOLD = 0.022;
const MIN_UTTERANCE_MS = 700;
/** Durée cumulée de voix réelle requise pour envoyer un segment en transcription. */
const MIN_VOICED_MS = 500;

/**
 * Micro en écoute continue avec détection de silence : dès que le candidat
 * arrête de parler, le segment est transcrit et renvoyé au jury. Aucun bouton
 * « question suivante » n'est nécessaire, la conversation s'enchaîne d'elle-même.
 */
export function useLiveMic({
  onUtterance,
  onSpeechStart,
}: {
  onUtterance: (text: string) => void;
  onSpeechStart?: () => void;
}) {
  const transcribe = useServerFn(transcribeAudio);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number | null>(null);
  const activeRef = useRef(false);
  const hadSpeechRef = useRef(false);
  const segmentStartRef = useRef(0);
  const lastVoiceRef = useRef(0);
  const voicedMsRef = useRef(0);
  const lastTickRef = useRef(0);
  const flushingRef = useRef(false);
  const cbRef = useRef({ onUtterance, onSpeechStart });
  cbRef.current = { onUtterance, onSpeechStart };

  /** Démarre un nouveau segment d'enregistrement sur le flux déjà ouvert. */
  const startSegment = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || !activeRef.current) return;
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    hadSpeechRef.current = false;
    voicedMsRef.current = 0;
    segmentStartRef.current = Date.now();
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      const long = Date.now() - segmentStartRef.current > MIN_UTTERANCE_MS;
      // On n'envoie jamais un segment sans parole détectée : sinon le modèle
      // audio « invente » une phrase à partir du silence ou du bruit de fond.
      const shouldSend =
        long && blob.size > 2000 && hadSpeechRef.current && voicedMsRef.current >= MIN_VOICED_MS;
      if (shouldSend) {
        setTranscribing(true);
        try {
          const buffer = await blob.arrayBuffer();
          let binary = "";
          const bytes = new Uint8Array(buffer);
          for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
          const res = await transcribe({
            data: { audioBase64: btoa(binary), mimeType: blob.type || "audio/webm" },
          });
          if (res.transcript?.trim()) cbRef.current.onUtterance(res.transcript.trim());
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Transcription impossible.");
        } finally {
          setTranscribing(false);
        }
      }
      flushingRef.current = false;
      if (activeRef.current) startSegment();
    };
    recorder.start();
    recorderRef.current = recorder;
  }, [transcribe]);

  /** Coupe le segment en cours : il partira en transcription puis au jury. */
  const flush = useCallback(() => {
    if (flushingRef.current) return;
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    flushingRef.current = true;
    setSpeaking(false);
    recorder.stop();
    recorderRef.current = null;
  }, []);

  const stop = useCallback(() => {
    activeRef.current = false;
    setListening(false);
    setSpeaking(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording") recorder.stop();
    recorderRef.current = null;
    void ctxRef.current?.close();
    ctxRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (activeRef.current) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const buf = new Float32Array(analyser.fftSize);

      activeRef.current = true;
      setListening(true);
      lastVoiceRef.current = Date.now();
      lastTickRef.current = 0;
      startSegment();

      const tick = () => {
        if (!activeRef.current) return;
        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i += 1) sum += buf[i]! * buf[i]!;
        const rms = Math.sqrt(sum / buf.length);
        const now = Date.now();
        const dt = lastTickRef.current ? Math.min(now - lastTickRef.current, 100) : 0;
        lastTickRef.current = now;
        if (rms > SPEECH_THRESHOLD) {
          voicedMsRef.current += dt;
          lastVoiceRef.current = now;
          if (!hadSpeechRef.current) {
            hadSpeechRef.current = true;
            setSpeaking(true);
            cbRef.current.onSpeechStart?.();
          }
        } else if (hadSpeechRef.current && now - lastVoiceRef.current > SILENCE_MS) {
          flush();
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return true;
    } catch {
      toast.error("Micro inaccessible : autorisez le microphone pour parler au jury.");
      return false;
    }
  }, [flush, startSegment]);

  useEffect(() => stop, [stop]);

  return { listening, speaking, transcribing, start, stop, flush };
}
