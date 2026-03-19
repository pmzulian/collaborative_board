import { createContext, useContext } from "react";
import type { BoardState, BoardAction } from "../types";

interface BoardContextValue {
  state: BoardState;
  dispatch: React.Dispatch<BoardAction>;
}

export const BoardContext = createContext<BoardContextValue>({} as BoardContextValue);

export function useBoardContext(): BoardContextValue {
  const ctx = useContext(BoardContext);
  if (!ctx) {
    throw new Error("useBoardContext must be used inside <BoardProvider>");
  }
  return ctx;
}
