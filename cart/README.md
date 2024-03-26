# cart

This is the backendservice that implements the shopping cart logic.  
A cart consists of a unique `userId` which identifies the "owner" of the cart and a set of products which are currently in the cart.  
The products is an array of objects `product_id [number]` : `qty [number]`

## API
The card offers the following API calls to interact with:

### /cart/{userId}
For up to date specifications check out the file api_specification.xlsx in Teams.  


| METHOD | BODY      | EFFECT                     | NOTE                                     |   |
|--------|-----------|----------------------------|------------------------------------------|---|
| GET    | no body   | get cart with userId       | 404 if cart with userId not found                                  |   |
| POST   | no body   | create cart with userId    | 409 if there is already a cart with userId                                         |   |
| PUT    | product_id | update cart with userId, add +1 qty to product_id                | 404 if cart with userId not found. If product_id not in cart, create with qty 1 |   |
| DELETE | product_id | update cart with userId, decrease -1 qty to product | 404 if cart with userId not found. If product_id has qty 1, remove it from the cart       |   |

## Test
To run tests with coverage, run the following line from a terminal in the root directory
```
python -m pytest cart/test -s --cov=cart/ --cov-report=html
```