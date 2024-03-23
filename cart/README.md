# cart

This is the backendservice that implements the shopping cart logic.  
A cart consists of a unique userId which identifies the "owner" of the cart and a set of products which are currently in the cart.

## API
The card offers the following API calls to interact with:

### /cart/{userId}
| METHOD | BODY      | EFFECT                     | NOTE                                     |   |
|--------|-----------|----------------------------|------------------------------------------|---|
| GET    | no body   | get cart with userId       |                                          |   |
| POST   | no body   | create cart with userId    |                                          |   |
| PUT    | productId | update cart with userId, add product                | success if it already exists, do nothing |   |
| DELETE | productId | update cart with userId, remove product | success if not present, do nothing       |   |