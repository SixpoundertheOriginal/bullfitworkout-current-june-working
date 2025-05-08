
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { MultiSelect } from '@/components/MultiSelect';
import { renderWithProviders } from '@/test/utils';

describe('MultiSelect Component', () => {
  const options = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' }
  ];

  test('renders with placeholder when no options are selected', () => {
    renderWithProviders(
      <MultiSelect
        options={options}
        selected={[]}
        onChange={jest.fn()}
        placeholder="Select options"
      />
    );

    expect(screen.getByText('Select options')).toBeInTheDocument();
  });

  test('displays selected options as badges', () => {
    renderWithProviders(
      <MultiSelect
        options={options}
        selected={['option1', 'option3']}
        onChange={jest.fn()}
        placeholder="Select options"
      />
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });

  test('calls onChange when an option is selected', async () => {
    const onChange = jest.fn();

    renderWithProviders(
      <MultiSelect
        options={options}
        selected={['option1']}
        onChange={onChange}
        placeholder="Select options"
      />
    );

    // Open the dropdown
    fireEvent.click(screen.getByRole('combobox'));

    // Wait for the popover to appear
    await waitFor(() => {
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    // Click on an unselected option
    fireEvent.click(screen.getByText('Option 2'));

    // Check if onChange was called with the updated array
    expect(onChange).toHaveBeenCalledWith(['option1', 'option2']);
  });

  test('calls onChange when a selected option is removed', async () => {
    const onChange = jest.fn();

    renderWithProviders(
      <MultiSelect
        options={options}
        selected={['option1', 'option2']}
        onChange={onChange}
        placeholder="Select options"
      />
    );

    // Find and click the X button on the first badge
    const removeButtons = screen.getAllByRole('button');
    fireEvent.click(removeButtons[0]); // First X button

    // Check if onChange was called with the updated array (option1 removed)
    expect(onChange).toHaveBeenCalledWith(['option2']);
  });

  test('dropdown stays open when shouldCloseOnSelect is false (default)', async () => {
    renderWithProviders(
      <MultiSelect
        options={options}
        selected={[]}
        onChange={jest.fn()}
        placeholder="Select options"
      />
    );

    // Open the dropdown
    fireEvent.click(screen.getByRole('combobox'));

    // Click on an option
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Option 1'));

    // Verify the dropdown is still open
    await waitFor(() => {
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });
});
