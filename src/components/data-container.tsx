import React, { useEffect } from 'react';
import { useVehicleStore } from '../store/vehicleStore';
import { ErrorComponent } from './ui/error';
import { Loading } from './ui/loading';

interface DataContainerProps {
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
  loadingMessage?: string;
}

/**
 * Container component that handles loading and error states
 */
export const DataContainer: React.FC<DataContainerProps> = ({
  isLoading,
  error,
  onRetry,
  children,
  loadingMessage,
}) => {
  if (isLoading) {
    return <Loading message={loadingMessage} />;
  }

  if (error) {
    return (
      <ErrorComponent
        message={error}
        onRetry={onRetry}
        showRetry={!!onRetry}
      />
    );
  }

  return <>{children}</>;
};

/**
 * HOC to wrap components with data fetching logic
 */
export const withDataFetching = <P extends object>(
  Component: React.ComponentType<P>,
  dataFetcher: () => Promise<void>
) => {
  const WithDataFetching = (props: P) => {
    const { loading, error, setLoading, setError, clearError } =
      useVehicleStore();

    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          clearError();
          await dataFetcher();
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : 'Erro ao carregar dados';
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [setLoading, setError, clearError]);

    const handleRetry = async () => {
      try {
        setLoading(true);
        clearError();
        await dataFetcher();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao carregar dados';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    return (
      <DataContainer
        isLoading={loading}
        error={error}
        onRetry={handleRetry}
      >
        <Component {...props} />
      </DataContainer>
    );
  };

  WithDataFetching.displayName = `withDataFetching(${Component.displayName || Component.name || 'Component'})`;

  return WithDataFetching;
};

export type { DataContainerProps };

