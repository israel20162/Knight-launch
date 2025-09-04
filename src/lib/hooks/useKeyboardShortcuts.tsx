import { useEffect } from "react";

type ShortcutHandler = (event: KeyboardEvent) => void;

interface Shortcut {
  keys: string[];
  handler: ShortcutHandler;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(({ keys, handler }) => {
        const key = event.key.toLowerCase();

        const match =
          keys.includes(key) &&
          (!keys.includes("ctrl") || event.ctrlKey) &&
          (!keys.includes("shift") || event.shiftKey) &&
          (!keys.includes("alt") || event.altKey) &&
          (!keys.includes("meta") || event.metaKey);

        if (match) {
          event.preventDefault();
          handler(event);
        }
      });
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
