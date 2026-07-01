"use client";

import { useEffect, useRef, useCallback } from "react";

type CleanupFn = () => void;

export function useCleanup() {
  const fnsRef = useRef<Set<CleanupFn>>(new Set());

  const addCleanup = useCallback((fn: CleanupFn) => {
    fnsRef.current.add(fn);
    return () => {
      fnsRef.current.delete(fn);
    };
  }, []);

  useEffect(() => {
    return () => {
      fnsRef.current.forEach((fn) => {
        try { fn(); } catch { /* silent */ }
      });
      fnsRef.current.clear();
    };
  }, []);

  return { addCleanup };
}

export function useTimer(callback: () => void, delayMs: number, enabled = true) {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  useEffect(() => {
    if (!enabled) return;
    const id = window.setTimeout(() => savedCallback.current(), delayMs);
    return () => window.clearTimeout(id);
  }, [delayMs, enabled]);
}

export function useInterval(callback: () => void, delayMs: number, enabled = true) {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  useEffect(() => {
    if (!enabled || delayMs <= 0) return;
    const id = window.setInterval(() => savedCallback.current(), delayMs);
    return () => window.clearInterval(id);
  }, [delayMs, enabled]);
}

export function useEventListener<K extends keyof WindowEventMap>(
  event: K,
  handler: (e: WindowEventMap[K]) => void,
  target: EventTarget = window,
  options?: AddEventListenerOptions
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const listener = (e: WindowEventMap[K]) => handlerRef.current(e);
    target.addEventListener(event, listener as EventListener, options);
    return () => target.removeEventListener(event, listener as EventListener, options);
  }, [event, target, options]);
}

export function useWebSocket(url: string | null, options?: {
  onMessage?: (data: unknown) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (e: Event) => void;
  reconnectInterval?: number;
  maxReconnects?: number;
}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!url) return;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectCount.current = 0;
      options?.onOpen?.();
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        options?.onMessage?.(data);
      } catch {
        options?.onMessage?.(e.data);
      }
    };

    ws.onclose = () => {
      options?.onClose?.();
      if (mountedRef.current && reconnectCount.current < (options?.maxReconnects ?? 5)) {
        reconnectCount.current++;
        const delay = Math.min(1000 * Math.pow(2, reconnectCount.current), 30000);
        setTimeout(connect, delay);
      }
    };

    ws.onerror = (e) => {
      options?.onError?.(e);
    };
  }, [url, options]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { send, close: () => wsRef.current?.close() };
}
