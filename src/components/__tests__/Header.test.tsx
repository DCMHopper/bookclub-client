import { render, screen, cleanup } from '@testing-library/preact';
import { describe, it, expect } from 'vitest';
import { LocationProvider } from 'preact-iso';
import { h } from 'preact';
import { Header } from '../Header';

function setup(url: string) {
  window.history.pushState({}, '', url);
  return render(
    <LocationProvider url={url} onChange={() => {}}>
      <Header />
    </LocationProvider>
  );
}

describe('Header', () => {
  it('highlights the active link when navigating', () => {
    setup('/');
    expect(screen.getByText('Home').classList.contains('active')).toBe(true);
    cleanup();

    setup('/404');
    expect(screen.getByText('404').classList.contains('active')).toBe(true);
  });
});
