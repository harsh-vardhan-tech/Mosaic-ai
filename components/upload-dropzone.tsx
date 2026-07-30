"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, LoaderCircle, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { api, ApiError, type Item } from "@/lib/api";
import { cn } from "@/lib/utils";

const ACCEPT = ".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp";
const MAX_SIZE_BYTES = 15 * 1024 * 1024;

type UploadStatus = "uploading" | "done" | "error";

interface UploadTask {
  key: string;
  fileName: string;
  status: UploadStatus;
  error?: string;
}

export function UploadDropzone({ onUploaded }: { onUploaded: (item: Item) => void }) {
  const [dragging, setDragging] = useState(false);
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    (files: FileList | File[]) => {
      Array.from(files).forEach((file) => {
        const key = `${file.name}-${file.size}-${Date.now()}`;

        if (file.size > MAX_SIZE_BYTES) {
          setTasks((prev) => [
            ...prev,
            { key, fileName: file.name, status: "error", error: "File is over 15MB" },
          ]);
          return;
        }

        setTasks((prev) => [...prev, { key, fileName: file.name, status: "uploading" }]);

        api
          .uploadItem(file)
          .then((item) => {
            setTasks((prev) => prev.map((t) => (t.key === key ? { ...t, status: "done" } : t)));
            onUploaded(item);
          })
          .catch((err) => {
            const message = err instanceof ApiError ? err.message : "Upload failed — try again";
            setTasks((prev) =>
              prev.map((t) => (t.key === key ? { ...t, status: "error", error: message } : t))
            );
          });
      });
    },
    [onUploaded]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "pulse-ring group relative flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-300",
          dragging
            ? "border-gold bg-gold/8 shadow-[0_0_30px_hsl(var(--gold)/0.2)]"
            : "border-border hover:border-gold/50 hover:bg-surface-raised/60"
        )}
      >
        {/* Animated background shimmer on drag */}
        {dragging && (
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 50% 50%, hsl(var(--gold)), transparent)",
            }}
            aria-hidden="true"
          />
        )}

        <div
          className={cn(
            "relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300",
            dragging
              ? "bg-gold/20 text-gold scale-110"
              : "bg-surface text-muted group-hover:bg-gold/10 group-hover:text-gold group-hover:scale-105"
          )}
        >
          <UploadCloud size={26} />
          {dragging && (
            <Sparkles
              size={12}
              className="absolute -right-1 -top-1 animate-bounce text-gold"
              aria-hidden="true"
            />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">
            {dragging ? "Drop to upload & analyze" : "Drop files here or click to browse"}
          </p>
          <p className="mt-1 text-xs text-muted">
            PDF, DOCX, TXT, JPG, PNG, WEBP — up to 15MB
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => e.target.files?.length && uploadFiles(e.target.files)}
        />
      </div>

      {tasks.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {tasks.map((task) => (
            <li
              key={task.key}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all",
                task.status === "done"
                  ? "bg-tile-teal/8 ring-1 ring-inset ring-tile-teal/20"
                  : task.status === "error"
                  ? "bg-tile-coral/8 ring-1 ring-inset ring-tile-coral/20"
                  : "bg-surface-raised"
              )}
            >
              {task.status === "uploading" && (
                <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-gold" />
              )}
              {task.status === "done" && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-tile-teal" />
              )}
              {task.status === "error" && (
                <XCircle className="h-4 w-4 shrink-0 text-tile-coral" />
              )}
              <span className="flex-1 truncate font-medium">{task.fileName}</span>
              <span className="shrink-0 text-xs text-muted">
                {task.status === "uploading" && "AI reading & categorizing…"}
                {task.status === "done" && "Added to Mosaic"}
                {task.status === "error" && task.error}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
