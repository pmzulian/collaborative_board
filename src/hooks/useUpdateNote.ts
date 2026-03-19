import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateNote } from '../services/api.service';
import type { UpdateNoteInput } from '../services/api.service';
import { NOTES_QUERY_KEY } from './useNotes';

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateNoteInput) => updateNote(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });
}
