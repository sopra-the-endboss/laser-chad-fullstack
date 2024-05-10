# cart

This is the backendservice that implements the shopping cart logic.  
Like all microservices, it consists of lambda functions and a Dynamo table.  
A cart consists of a unique `user_id` which identifies the "owner" of the cart and a set of products which are currently in the cart.  
The service uses a Dynamo table `cart-table`, where `user_id` is the primary key. Each item in the table has the following structure:
```json
{
    "user_id": {
        "type": "string"
    },
    "products": {
        "type": "array",
        "minItems": 0,
        "items": {
            "type": "object",
            "required": [
                "product_id",
                "quantity"
            ],
            "properties": {
                "product_id": {
                    "type": "string"
                },
                "quantity": {
                    "type": "number"
                }
            }
        }
    }
}
```
A product object in the `products` array can contain additional fields, the above structure is the minimal structure present in the objects.

## API
For a documentation of the API refer to the [Wiki](https://github.com/sopra-the-endboss/laser-chad-fullstack-wiki/wiki)