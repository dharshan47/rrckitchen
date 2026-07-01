"use client";

import { useEffect, useRef, useCallback } from "react";
import { globalEventBus } from "@/lib/patterns/event-bus";

export function useEventBus<T = unknown>(event: string, handler: (payload: T) => void) {
  const handlerRef = useRef(handler);
  useEffect(() => { handlerRef.current = handler; });

  useEffect(() => {
    const unsubscribe = globalEventBus.on<T>(event, (payload) => {
      handlerRef.current(payload);
    });
    return unsubscribe;
  }, [event]);
}

export function useEventBusOnce<T = unknown>(event: string, handler: (payload: T) => void) {
  const handlerRef = useRef(handler);
  useEffect(() => { handlerRef.current = handler; });

  useEffect(() => {
    globalEventBus.once<T>(event, (payload) => {
      handlerRef.current(payload);
    });
  }, [event]);
}

export function useEmitEvent() {
  return useCallback(<T>(event: string, payload: T) => {
    globalEventBus.emit(event, payload);
  }, []);
}
