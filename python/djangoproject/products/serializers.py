from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['product_id', 'product', 'highlighted', 'image', 'price', 'discount', 'formatted_text', 'category', 'brand']