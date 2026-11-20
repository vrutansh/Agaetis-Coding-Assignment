import * as Dialog from '@radix-ui/react-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Employee, EmployeeInput } from '../types/employee';

const employeeFormSchema = z.object({
  name: z.string().trim().min(2, 'Enter at least 2 characters').max(120, 'Use 120 characters or fewer'),
  email: z.string().trim().email('Enter a valid email address').max(254, 'Email address is too long'),
  role: z.string().trim().min(1, 'Enter a job role').max(100, 'Use 100 characters or fewer'),
});

interface Props {
  open: boolean;
  employee: Employee | null;
  isPending: boolean;
  serverError: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: EmployeeInput) => Promise<void>;
}

const emptyValues = { name: '', email: '', role: '' };

export function EmployeeFormDialog({ open, employee, isPending, serverError, onOpenChange, onSubmit }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EmployeeInput>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) reset(employee ? { name: employee.name, email: employee.email, role: employee.role } : emptyValues);
  }, [employee, open, reset]);

  const title = employee ? 'Edit employee' : 'Add employee';

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content" aria-describedby="employee-dialog-description">
          <div className="dialog-header">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Description id="employee-dialog-description">
                {employee ? 'Update this person’s directory details.' : 'Add a person to your company directory.'}
              </Dialog.Description>
            </div>
            <Dialog.Close className="icon-button" aria-label="Close" disabled={isPending}><X size={19} /></Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-fields">
              <Field label="Full Name" error={errors.name?.message}>
                <input autoFocus autoComplete="name" placeholder="e.g. Maya Chen" aria-invalid={!!errors.name} {...register('name')} />
              </Field>
              <Field label="Email Address" error={errors.email?.message}>
                <input type="email" autoComplete="email" placeholder="maya@company.com" aria-invalid={!!errors.email} {...register('email')} />
              </Field>
              <Field label="Job Role" error={errors.role?.message}>
                <input autoComplete="organization-title" placeholder="e.g. Product Designer" aria-invalid={!!errors.role} {...register('role')} />
              </Field>
              {serverError && <div className="form-error" role="alert">{serverError}</div>}
            </div>
            <div className="dialog-actions">
              <button type="button" className="button button--secondary" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</button>
              <button type="submit" className="button button--primary" disabled={isPending}>
                {isPending && <LoaderCircle className="spin" size={17} />}
                {isPending ? 'Saving…' : employee ? 'Save changes' : 'Add employee'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label} <b aria-hidden="true">*</b></span>
      {children}
      {error && <small role="alert">{error}</small>}
    </label>
  );
}
