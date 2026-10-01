import { useRef, useState } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { transcribeAudio } from "@/lib/ai.functions";

/**
 * Enregistrement micro + transcription IA. Le transcript est inséré dans le champ
 * cible que l'étudiant peut ensuite valider ou amender.
 */
export function OralAnswer({ onTranscript, label = "Répondre à l'oral" }: { onTranscript: (text: string) => void; label?: string }) {
  const transcribe = useServerFn(transcribeAudio);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setBusy(true);
        try {
          const buffer = await blob.arrayBuffer();
          let binary = "";
          const bytes = new Uint8Array(buffer);
          for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
          const base64 = btoa(binary);
          const res = await transcribe({ data: { audioBase64: base64, mimeType: blob.type || "audio/webm" } });
          if (res.transcript) {
            onTranscript(res.transcript);
            toast.success("Transcript inséré - relisez et amendez-le.");
          } else {
            toast.error("Transcription vide, réessayez.");
          }
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Transcription impossible.");
        } finally {
          setBusy(false);
        }
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      toast.error("Micro inaccessible. Autorisez l'accès au microphone.");
    }
  }

  function stop() {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={recording ? "destructive" : "secondary"}
      disabled={busy}
      onClick={recording ? stop : start}
    >
      {busy ? (
        <>
          <Loader2 className="size-4 animate-spin" /> Transcription…
        </>
      ) : recording ? (
        <>
          <Square className="size-4" /> Arrêter
        </>
      ) : (
        <>
          <Mic className="size-4" /> {label}
        </>
      )}
    </Button>
  );
}
