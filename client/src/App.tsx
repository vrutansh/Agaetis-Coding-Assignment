import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { DeleteEmployeeDialog } from './components/DeleteEmployeeDialog';
import { EmptyState, ErrorState, LoadingState } from './components/DirectoryStates';
import { EmployeeDirectory } from './components/EmployeeDirectory';
import { EmployeeFormDialog } from './components/EmployeeFormDialog';
import { useToast } from './components/toast-context';
import { useDebouncedValue } from './hooks/use-debounced-value';
import { createEmployee, deleteEmployee, getApiErrorMessage, getEmployees, updateEmployee } from './lib/api/employees';
import type { Employee, EmployeeInput } from './types/employee';

const PAGE_SIZE = 10;

export default function App() {
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const employeesQuery = useQuery({
    queryKey: ['employees', debouncedSearch, page],
    queryFn: () => getEmployees(debouncedSearch, page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  const saveMutation = useMutation({
    mutationFn: (input: EmployeeInput) => editingEmployee
      ? updateEmployee({ id: editingEmployee.id, input })
      : createEmployee(input),
    onSuccess: async () => {
      const wasEditing = !!editingEmployee;
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
      setFormOpen(false);
      setEditingEmployee(null);
      setFormError(null);
      notify(wasEditing ? 'Employee details updated.' : 'Employee added to the directory.');
    },
    onError: (error) => setFormError(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: async () => {
      setDeletingEmployee(null);
      if ((employeesQuery.data?.data.length ?? 0) === 1 && page > 1) setPage((current) => current - 1);
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
      notify('Employee removed from the directory.');
    },
    onError: (error) => notify(getApiErrorMessage(error), 'error'),
  });

  const openAdd = () => {
    setEditingEmployee(null);
    setFormError(null);
    setFormOpen(true);
  };
  const openEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormError(null);
    setFormOpen(true);
  };

  const pagination = employeesQuery.data?.pagination;
  const total = pagination?.total ?? 0;
  const employees = employeesQuery.data?.data ?? [];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="/" aria-label="Roster home">
            <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
            <span className="brand-copy"><strong>Roster</strong><small>People, thoughtfully organized.</small></span>
          </a>
          <span className="context-label">People directory <i aria-hidden="true">R</i></span>
        </div>
      </header>

      <main>
        <section className="page-heading">
          <div className="hero-copy">
            <p className="eyebrow"><span>People directory</span><i aria-hidden="true" /></p>
            <h1>The people<br />behind the work.</h1>
            <p>Names, roles, and the human details that keep your team connected.</p>
          </div>
          <div className="hero-aside">
            <div className="people-count" aria-label={employeesQuery.isLoading ? 'Loading employee count' : `${total} people on the roster`}>
              <strong>{employeesQuery.isLoading ? '—' : total}</strong>
              <span>{total === 1 ? 'person' : 'people'}<br />on the roster</span>
            </div>
            <button className="button button--primary button--large" onClick={openAdd}><Plus size={18} />Add employee</button>
          </div>
        </section>

        <section className="directory-panel" aria-labelledby="directory-title">
          <div className="directory-toolbar">
            <div className="directory-title"><p>Directory</p><h2 id="directory-title">Everyone, at a glance.</h2></div>
            <label className="search-box"><Search size={18} aria-hidden="true" /><span className="sr-only">Search employees by name</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search by name…" /></label>
          </div>

          {employeesQuery.isLoading ? <LoadingState /> : employeesQuery.isError ? <ErrorState onRetry={() => employeesQuery.refetch()} /> : employees.length === 0 ? (
            <EmptyState searching={!!debouncedSearch} onAdd={openAdd} />
          ) : (
            <EmployeeDirectory employees={employees} onEdit={openEdit} onDelete={setDeletingEmployee} />
          )}

          {pagination && pagination.totalPages > 0 && (
            <div className="pagination">
              <p>Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong></p>
              <div>
                <button className="button button--secondary" onClick={() => setPage((current) => current - 1)} disabled={page <= 1 || employeesQuery.isFetching}><ChevronLeft size={17} />Previous</button>
                <button className="button button--secondary" onClick={() => setPage((current) => current + 1)} disabled={page >= pagination.totalPages || employeesQuery.isFetching}>Next<ChevronRight size={17} /></button>
              </div>
            </div>
          )}
        </section>
      </main>

      <EmployeeFormDialog open={formOpen} employee={editingEmployee} isPending={saveMutation.isPending} serverError={formError} onOpenChange={setFormOpen} onSubmit={async (input) => { setFormError(null); await saveMutation.mutateAsync(input); }} />
      <DeleteEmployeeDialog employee={deletingEmployee} isPending={deleteMutation.isPending} onOpenChange={(open) => !open && setDeletingEmployee(null)} onConfirm={() => deletingEmployee && deleteMutation.mutate(deletingEmployee.id)} />
    </div>
  );
}
