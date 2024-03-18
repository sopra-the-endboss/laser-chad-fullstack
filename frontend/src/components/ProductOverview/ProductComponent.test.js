import {fireEvent, render, screen} from '@testing-library/react';
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
    expect(screen.getByText('20.00')).toBeInTheDocument();
    expect(screen.getByAltText('green iguana')).toHaveAttribute('src', 'test.jpg');
});


test('ProductComponent displays product details', () => {
    const mockProps = {
        product_id: '1',
        title: 'Test Product',
        img: 'test.jpg',
        price: 19.99,
        description: 'Test Description',
        brand: 'Test Brand',
        category: 'Test Category',
        clickable: true,
        onCardInteract: jest.fn(),
    };
    render(
        <BrowserRouter>
            <ProductComponent {...mockProps} />
        </BrowserRouter>
    );
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
    expect(screen.getByText('19.99')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
});

test('ProductComponent calls onCardInteract when clicked', async () => {
    const mockProps = {
        product_id: 1,
        title: 'Test Product',
        img: 'test.jpg',
        price: 19.99,
        description: 'Test Description',
        brand: 'Test Brand',
        category: 'Test Category',
        clickable: true,
        onCardInteract: jest.fn(),
    };
    render(
        <BrowserRouter>
            <ProductComponent {...mockProps} />
        </BrowserRouter>
    );

    const clickableElement = screen.getByTestId('card-clickable');
    fireEvent.click(clickableElement)
    expect(mockProps.onCardInteract).toHaveBeenCalledWith(true, 1);
});

test('Direct call to onCardInteract mock', () => {
    const mockOnCardInteract = jest.fn();
    mockOnCardInteract(true, '1');
    expect(mockOnCardInteract).toHaveBeenCalledWith(true, 1);
});
