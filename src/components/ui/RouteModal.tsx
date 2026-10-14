"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { FormPresentation } from "./FormSurface";

/** The main page owns the modal, including direct visits and reloads. */
export function RouteModal({ children, closeHref }: { children: ReactNode; closeHref: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    element?.showModal();
    return () => {
      element?.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  function busy() {
    return Boolean(dialog.current?.querySelector('[aria-busy="true"]'));
  }

  function close() {
    if (!busy()) router.replace(closeHref, { scroll: false });
  }

  return <dialog ref={dialog} aria-label="Detalhes e edição do planejamento" onCancel={(event) => {
    event.preventDefault();
    close();
  }} onClick={(event) => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
  }} className="route-modal m-auto max-h-[90dvh] w-[calc(100%-1rem)] max-w-3xl overflow-y-auto overscroll-contain rounded-surface border border-border bg-surface p-0 text-text-primary shadow-xl backdrop:bg-text-primary/40 sm:w-[calc(100%-3rem)]">
    <div className="sticky top-0 z-40 flex justify-end bg-surface px-3 pt-2">
      <button type="button" onClick={close} aria-label="Fechar modal" className="flex size-11 items-center justify-center rounded-full text-text-secondary hover:bg-background"><X aria-hidden="true" className="size-5" /></button>
    </div>
    <FormPresentation value="embedded"><div className="px-4 pb-6 sm:px-8 sm:pb-8">{children}</div></FormPresentation>
  </dialog>;
}
