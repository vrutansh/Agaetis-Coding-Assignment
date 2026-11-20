import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { LoaderCircle, TriangleAlert } from 'lucide-react';
import type { Employee } from '../types/employee';

interface Props {
  employee: Employee | null;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteEmployeeDialog({ employee, isPending, onOpenChange, onConfirm }: Props) {
  return (
    <AlertDialog.Root open={!!employee} onOpenChange={(open) => !isPending && onOpenChange(open)}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="dialog-overlay" />
        <AlertDialog.Content className="alert-content">
          <div className="alert-icon"><TriangleAlert size={22} /></div>
          <AlertDialog.Title>Delete {employee?.name}?</AlertDialog.Title>
          <AlertDialog.Description>
            This person will be permanently removed from the directory. This action cannot be undone.
          </AlertDialog.Description>
          <div className="dialog-actions">
            <AlertDialog.Cancel asChild><button className="button button--secondary" disabled={isPending}>Cancel</button></AlertDialog.Cancel>
            <button className="button button--danger" onClick={onConfirm} disabled={isPending}>
              {isPending && <LoaderCircle className="spin" size={17} />}
              {isPending ? 'Deleting…' : 'Delete employee'}
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
