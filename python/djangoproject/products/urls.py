from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, ProductList

router = DefaultRouter()
router.register(r'products', ProductViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('bulk/', ProductList.as_view()),
]