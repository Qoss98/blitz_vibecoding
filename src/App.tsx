import './App.css';
import { ErrorBoundary } from './components/error-boundary';
import { SchedulePage } from './features/schedule/containers/schedule-page';

function App() {
  return (
    <ErrorBoundary>
      <SchedulePage />
    </ErrorBoundary>
  );
}

export default App;
