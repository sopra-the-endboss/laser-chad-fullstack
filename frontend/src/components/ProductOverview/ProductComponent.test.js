import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ProductComponent from './ProductComponent';

// Wrap your component with BrowserRouter to provide routing context
test('ProductComponent renders with given props', () => {
    render(
        <BrowserRouter>
            <ProductComponent title="Test Product" img="test.jpg" price={20} description="Test Description" />
        </BrowserRouter>
    );
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$20.00')).toBeInTheDocument();
    expect(screen.getByAltText('green iguana')).toHaveAttribute('src', 'test.jpg');
});

test('Clickable ProductComponent triggers onCardInteract', async () => {
    const mockOnCardInteract = jest.fn();
    render(
        <BrowserRouter>
            <ProductComponent title="Clickable Product" clickable={true} onCardInteract={mockOnCardInteract} product_id="1" />
        </BrowserRouter>
    );

    await userEvent.click(screen.getByRole('button'));
    expect(mockOnCardInteract).toHaveBeenCalledWith(true, "1");
});
