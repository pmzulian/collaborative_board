import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteNote } from '../services/api.service';
import { NOTES_QUERY_KEY } from './useNotes';

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });
}
