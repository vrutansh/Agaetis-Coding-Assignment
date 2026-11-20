import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EmployeeFormDialog } from './EmployeeFormDialog';

describe('EmployeeFormDialog', () => {
  it('shows helpful validation and submits normalized valid values', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<EmployeeFormDialog open employee={null} isPending={false} serverError={null} onOpenChange={() => undefined} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add employee' }));
    expect(await screen.findByText('Enter at least 2 characters')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Enter a job role')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'Maya Chen' } });
    fireEvent.change(screen.getByLabelText(/Email Address/), { target: { value: 'maya@example.com' } });
    fireEvent.change(screen.getByLabelText(/Job Role/), { target: { value: 'Product Designer' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add employee' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(
      { name: 'Maya Chen', email: 'maya@example.com', role: 'Product Designer' },
      expect.anything(),
    ));
  });
});
