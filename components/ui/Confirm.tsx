"use client";
import { useCallback, useMemo, useState } from "react";

type State = {
  open: boolean;
  message: string;
  onYes?: () => Promise<void> | void;
};

export function useConfirm() {
  const [state, setState] = useState<State>({ open: false, message: "" });

  const ask = useCallback(async (message: string) => {
    return new Promise<void>((resolve, reject) => {
      setState({
        open: true,
        message,
        onYes: async () => {
          try {
            resolve();
          } finally {
            setState((s) => ({ ...s, open: false }));
          }
        },
      });
    });
  }, []);

  const Modal = useMemo(() => {
    if (!state.open) return null;
    return (
      <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60">
        <div className="w-[420px] max-w-[92%] rounded border border-white/10 bg-slate-900 p-4">
          <div className="mb-3 font-semibold">Onay</div>
          <div className="text-slate-300">{state.message}</div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setState((s) => ({ ...s, open: false }))}
              className="px-3 py-1.5 rounded border border-white/10"
            >
              Vazgeç
            </button>
            <button
              onClick={async () => {
                await state.onYes?.();
                setState((s) => ({ ...s, open: false }));
              }}
              className="px-3 py-1.5 rounded bg-rose-600 text-white"
            >
              Evet
            </button>
          </div>
        </div>
      </div>
    );
  }, [state]);

  return { Modal, ask, set: setState };
}
