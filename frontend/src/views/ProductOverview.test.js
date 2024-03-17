import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductOverview from "./ProductOverview";

test('ProductOverview renders correctly when no search query is submitted', () => {
    const mockData = []; // Provide mock data as needed
    render(
        <BrowserRouter>
            <ProductOverview isSearchQuerySubmitted={false} data={mockData} setCategoryFilter={() => {}} />
        </BrowserRouter>
    );
    expect(screen.getByText('HPLaserChads E-Commerce Solution')).toBeInTheDocument();
    // Add more assertions here for elements you expect to see when no search is submitted
});

test('ProductOverview filters products based on category filter', () => {
    const mockData = [{ category: 'Electronics' }, { category: 'Books' }]; // Simplified data
    const setCategoryFilter = jest.fn();
    render(
        <BrowserRouter>
            <ProductOverview isSearchQuerySubmitted={false} data={mockData} setCategoryFilter={setCategoryFilter} />
        </BrowserRouter>
    );
    // TODO: Simulate setting a category filter
    // TODO: Add logic here to trigger the filter effect
    // TODO: Assert that only products with the specified category are displayed
});
