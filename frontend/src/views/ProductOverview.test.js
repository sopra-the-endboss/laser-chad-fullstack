import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductOverview from "./ProductOverview";

test('ProductOverview renders correctly when no search query is submitted', () => {
    const mockData = [
        {
            "product_id": 10,
            "product": "AMD Ryzen 9 5900X",
            "highlighted": false,
            "image": "https://images.unsplash.com/photo-1537944434965-cf4679d1a598?auto=format&fit=crop&w=400&h=250&q=60",
            "price": 138.88,
            "formatted_text": "",
            "category": "Tech",
            "brand": "AMD"
        }];
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
