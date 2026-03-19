import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNote } from '../services/api.service';
import type { CreateNoteInput } from '../services/api.service';
import { NOTES_QUERY_KEY } from './useNotes';

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateNoteInput) => createNote(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });
}
