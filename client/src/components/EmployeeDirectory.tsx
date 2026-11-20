import { Mail, Pencil, Trash2 } from 'lucide-react';
import type { Employee } from '../types/employee';

interface Props {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
const formatDate = (date: string) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
const avatarTones = ['violet', 'blue', 'teal', 'amber', 'rose'] as const;
const avatarTone = (employee: Employee) => {
  const hash = [...employee.name].reduce((total, character) => total + character.charCodeAt(0), employee.id);
  return avatarTones[hash % avatarTones.length];
};

export function EmployeeDirectory({ employees, onEdit, onDelete }: Props) {
  return (
    <>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Employee</th><th>Email</th><th>Job role</th><th>Date added</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{employees.map((employee) => (
            <tr key={employee.id}>
              <td><Person employee={employee} /></td>
              <td><a className="email-link" href={`mailto:${employee.email}`}>{employee.email}</a></td>
              <td><span className="role-text">{employee.role}</span></td>
              <td><time dateTime={employee.created_at}>{formatDate(employee.created_at)}</time></td>
              <td><div className="row-actions">
                <button className="icon-button" onClick={() => onEdit(employee)} aria-label={`Edit ${employee.name}`}><Pencil size={17} /></button>
                <button className="icon-button icon-button--danger" onClick={() => onDelete(employee)} aria-label={`Delete ${employee.name}`}><Trash2 size={17} /></button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="mobile-list">{employees.map((employee) => (
        <article className="employee-card" key={employee.id}>
          <div className="card-top"><Person employee={employee} /></div>
          <div className="card-details">
            <div><span>Role</span><strong>{employee.role}</strong></div>
            <div><span>Added</span><time dateTime={employee.created_at}>{formatDate(employee.created_at)}</time></div>
          </div>
          <a className="card-email" href={`mailto:${employee.email}`}><Mail size={15} />{employee.email}</a>
          <div className="card-actions">
            <button className="button button--secondary" onClick={() => onEdit(employee)}><Pencil size={16} />Edit</button>
            <button className="button button--ghost-danger" onClick={() => onDelete(employee)}><Trash2 size={16} />Delete</button>
          </div>
        </article>
      ))}</div>
    </>
  );
}

function Person({ employee }: { employee: Employee }) {
  return <div className="person"><span className={`avatar avatar--${avatarTone(employee)}`} aria-hidden="true">{initials(employee.name)}</span><strong>{employee.name}</strong></div>;
}
