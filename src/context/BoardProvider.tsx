import { useReducer, type ReactNode } from 'react';
import { BoardContext } from './BoardContext';
import { boardReducer, initialState } from './boardReducer';

export function BoardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
}
