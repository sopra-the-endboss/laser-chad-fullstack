from django.db import models

class Product(models.Model):
    product_id = models.IntegerField()
    product = models.CharField(max_length=200)
    highlighted = models.BooleanField(default=False)
    image = models.URLField(max_length=200, null=True, blank=True)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    discount = models.IntegerField(null=True, blank=True)
    formatted_text = models.TextField(null=True, blank=True)
    category = models.CharField(max_length=200)
    brand = models.CharField(max_length=200)

    def __str__(self):
        return self.name
