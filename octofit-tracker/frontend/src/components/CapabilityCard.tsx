import { useEffect, useState, type ReactNode } from 'react';

type LoadState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T };

type Props<T> = {
  title: string;
  description: string;
  load?: () => Promise<T>;
  controls?: ReactNode;
  idleMessage?: string;
  emptyMessage: string;
  isEmpty: (data: T) => boolean;
  render: (data: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, load, controls, idleMessage, emptyMessage, isEmpty, render }: Props<T>) {
  const [state, setState] = useState<LoadState<T>>(load ? { status: 'loading' } : { status: 'idle' });

  useEffect(() => {
    if (!load) {
      setState({ status: 'idle' });
      return;
    }

    let active = true;
    setState({ status: 'loading' });
    load().then((data) => {
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
  }, [load]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {controls}
        {state.status === 'idle' && idleMessage && <p role="status">{idleMessage}</p>}
        {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {state.status === 'error' && <p role="alert">Unable to load {title.toLowerCase()}: {state.message}</p>}
        {state.status === 'success' && (isEmpty(state.data)
          ? <p role="status">{emptyMessage}</p>
          : render(state.data))}
      </div>
    </section>
  );
}
