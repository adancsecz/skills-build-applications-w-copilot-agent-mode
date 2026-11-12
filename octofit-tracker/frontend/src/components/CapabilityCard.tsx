import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type LoadState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T };

type Props<T> = {
  title: string;
  description: string;
  path: string;
  emptyMessage: string;
  isEmpty: (data: T) => boolean;
  render: (data: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, path, emptyMessage, isEmpty, render }: Props<T>) {
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    getJson<T>(path).then((data) => {
      if (active) setState({ status: 'success', data });
    }).catch((error: unknown) => {
      if (active) {
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });
    return () => {
      active = false;
    };
  }, [path]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {state.status === 'error' && <p role="alert">Unable to load {title.toLowerCase()}: {state.message}</p>}
        {state.status === 'success' && (isEmpty(state.data)
          ? <p role="status">{emptyMessage}</p>
          : render(state.data))}
      </div>
    </section>
  );
}
