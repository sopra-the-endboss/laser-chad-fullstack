# cart

This is the backendservice that implements the shopping cart logic.  
A cart consists of a unique `userId` which identifies the "owner" of the cart and a set of products which are currently in the cart.  
The products is an array of objects `product_id [str]` : `quantity [number]`

## API
For the specification of the different API routes this service offers, refer to the [API Specification](../../api_specification.xlsx) file.

## Test
To run tests with coverage, run the following line from a terminal in the root directory
```
python -m pytest cart/test -s --cov=cart/ --cov-report=html
```