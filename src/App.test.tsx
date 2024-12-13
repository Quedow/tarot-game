import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import App from './App';

test('renders learn react link', () => {
  const { container } = render(<App />);
  expect(container).not.toBeNull();
});
