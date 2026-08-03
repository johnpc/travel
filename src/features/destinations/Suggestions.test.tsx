import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Suggestions } from './Suggestions';

const suggestions = [{ name: 'Oslo', blurb: 'Fjords.', why: 'Scenic.' }];

describe('Suggestions', () => {
  it('fires onSuggest when the button is clicked', () => {
    const onSuggest = vi.fn();
    render(
      <Suggestions suggestions={[]} isLoading={false} onSuggest={onSuggest} onAccept={vi.fn()} />,
    );
    fireEvent.click(screen.getByTestId('suggest-btn'));
    expect(onSuggest).toHaveBeenCalled();
  });

  it('shows a loading affordance and disables the button while loading', () => {
    render(<Suggestions suggestions={[]} isLoading onSuggest={vi.fn()} onAccept={vi.fn()} />);
    expect(screen.getByTestId('suggest-loading')).toBeInTheDocument();
    expect(screen.getByTestId('suggest-btn')).toHaveTextContent('Thinking…');
  });

  it('shows a friendly retryable message when the AI call failed', () => {
    render(
      <Suggestions suggestions={[]} isLoading={false} isError onSuggest={vi.fn()} onAccept={vi.fn()} />, // prettier-ignore
    );
    expect(screen.getByTestId('suggest-error')).toHaveTextContent(/try again/i);
    // the button is still enabled so the tap re-runs the suggest
    expect(screen.getByTestId('suggest-btn')).toBeEnabled();
  });

  it('hides the error while a retry is loading', () => {
    render(
      <Suggestions suggestions={[]} isLoading isError onSuggest={vi.fn()} onAccept={vi.fn()} />,
    );
    expect(screen.queryByTestId('suggest-error')).not.toBeInTheDocument();
  });

  it('renders suggestions and accepts one', () => {
    const onAccept = vi.fn();
    render(
      <Suggestions
        suggestions={suggestions}
        isLoading={false}
        onSuggest={vi.fn()}
        onAccept={onAccept}
      />,
    );
    expect(screen.getByText('Oslo')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('suggest-accept'));
    expect(onAccept).toHaveBeenCalledWith(suggestions[0]);
  });
});
