import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StockSearch } from './stock-search';

function setup() {
  const onSelect = vi.fn();
  const user = userEvent.setup();
  render(<StockSearch onSelect={onSelect} />);
  return { onSelect, user, input: screen.getByRole('combobox') };
}

const options = () => screen.findAllByRole('option');

describe('StockSearch', () => {
  it('opens a listbox of matches as you type', async () => {
    const { user, input } = setup();
    await user.type(input, 'inf');

    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
    expect((await options())[0]).toHaveTextContent('INFY');
  });

  it('selects with the keyboard alone', async () => {
    const { user, onSelect, input } = setup();
    await user.type(input, 'inf');
    await options();

    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ ticker: 'INFY' }));
  });

  it('moves the active option with arrow keys without moving focus', async () => {
    const { user, onSelect, input } = setup();
    await user.type(input, 'bank');
    const list = await options();
    expect(list.length).toBeGreaterThan(1);

    await user.keyboard('{ArrowDown}');
    expect(input).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
    // Second option, not the first.
    expect(onSelect.mock.calls[0]?.[0].ticker).toBe(list[1]?.getAttribute('data-ticker'));
  });

  it('wraps around at both ends of the list', async () => {
    const { user, onSelect, input } = setup();
    await user.type(input, 'bank');
    const list = await options();

    // Up from the first option lands on the last.
    const lastTicker = list[list.length - 1]?.getAttribute('data-ticker');
    await user.keyboard('{ArrowUp}{Enter}');
    expect(onSelect.mock.calls[0]?.[0].ticker).toBe(lastTicker);
  });

  it('points aria-activedescendant at the highlighted option', async () => {
    const { user, input } = setup();
    await user.type(input, 'tata');
    await options();

    const first = input.getAttribute('aria-activedescendant');
    expect(first).toBeTruthy();

    await user.keyboard('{ArrowDown}');
    expect(input.getAttribute('aria-activedescendant')).not.toBe(first);
  });

  it('closes on Escape without selecting', async () => {
    const { user, onSelect, input } = setup();
    await user.type(input, 'inf');
    await options();

    await user.keyboard('{Escape}');

    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'false'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('shows nothing for a query with no matches', async () => {
    const { user, input } = setup();
    await user.type(input, 'zzzzzz');

    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'false'));
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('clears the query after a selection', async () => {
    const { user, input } = setup();
    await user.type(input, 'infy');
    await options();
    await user.keyboard('{Enter}');

    await waitFor(() => expect(input).toHaveValue(''));
  });

  it('selects on pointer down', async () => {
    const { user, onSelect, input } = setup();
    await user.type(input, 'reliance');
    const [first] = await options();

    await user.click(first!);

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ ticker: 'RELIANCE' }));
  });
});
