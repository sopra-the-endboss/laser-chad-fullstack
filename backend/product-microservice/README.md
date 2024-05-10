# product-microservice

This is the part that implements the product microservices.  
The microservice handles the following logic in the backend:
- product
- product-comments
- orders
- category
- distributors
- my-shop

Like all microservices, it consists of lambda functions and multiple Dynamo tables.  

## product
The product microservice uses the `product-table` Dynamo table. An item of the table uses the key `product_id` and has the following structure
```json
{
    "product_id": {
        "type": "string"
    },
    "product": {
        "type": "string"
    },
    "images": {
        "type": "array",
        "items": {
            "type": "string"
        }
    },
    "price": {
        "type": "number"
    },
    "category": {
        "type": "string"
    },
    "brand": {
        "type": "string"
    },
    "seller_id": {
        "type": "string"
    }
}
```

## product-comment
The product comment microservice uses the `product-comment-table` as well as the `product-table` Dynamo tables. An item of `product-comment-table` uses the key `product_id` and has the following structure
```json
{
    "product_id": {
        "type": "string"
    },
    "reviews": {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "user": {
                    "type": "string"
                },
                "user_id": {
                    "type": "string"
                },
                "rating": {
                    "type": "integer"
                },
                "title": {
                    "type": "string"
                },
                "review": {
                    "type": "string"
                },
                "date": {
                    "type": "string"
                },
                "review_id": {
                    "type": "string"
                }
            },
            "required": ["user", "user_id", "rating", "title", "review", "date", "review_id"]
        }
    }
}
```

## order
The order microservices uses the `order-table` Dynamo table as well as the `product-table`. An item of the table uses the key `user_id` and has the following structure
```json
{
    "user_id": {
        "type": "string"
    },
    "orders": {
        "type": "array",
        "minItems": 0,
        "items": {
            "type": "object",
            "properties": {
                "order_id": {
                    "type": "string"
                },
                "status": {
                    "type": "string"
                },
                "products": {
                    "type": "array",
                    "minItems": 0,
                    "items": {
                        "product_id": {
                            "type": "string"
                        },
                        "product": {
                            "type": "string"
                        },
                        "images": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        },
                        "price": {
                            "type": "number"
                        },
                        "category": {
                            "type": "string"
                        },
                        "brand": {
                            "type": "string"
                        },
                        "seller_id": {
                            "type": "string"
                        }
                    }
                }
            },
            "required": ["order_id", "status", "products"]
        }
    },
    "required": ["user_id", "orders"]
}
```

## category
The category microservice uses the `category-table` Dynamo table. An item of the table uses the key `category_id` and has the following structure
```json
{
    "category_id": {
        "type": "string"
    },
    "name": {
        "type": "string"
    },
    "options": {
        "type": "array",
        "items": {
            "type": "string"
        }
    },
    "required": ["category_id", "name", "options"]
}
```


## distributor
The distributor microservice uses the `distributor-table` Dynamo table. An item of the table uses the key `distributor` and has the following structure
```json
{
    "distributor_id": {
        "type": "string"
    },
    "name": {
        "type": "string"
    },
    "industry": {
        "type": "string"
    },
    "headquarters": {
        "type": "string"
    },
    "numberOfEmployees": {
        "type": "number"
    },
    "foundationYear": {
        "type": "number"
    },
    "required": ["distributor_id", "name", "industry", "headquarters", "numberOfEmployees", "foundationYear"]
}
```


## my-shop
The my-shop microservice uses the `product-table` Dynamo table. Its purpose is to allow to fetch all products which are assigned to a seller.
```json
{
    "product_id": {
        "type": "string"
    },
    "product": {
        "type": "string"
    },
    "price": {
        "type": "number"
    },
    "seller_id": {
        "type": "string"
    },
    "required": ["product_id", "product", "price", "seller_id"]
}
```



## API
For a documentation of the API refer to the [Wiki](https://github.com/sopra-the-endboss/laser-chad-fullstack-wiki/wiki)