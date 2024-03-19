from django.shortcuts import render

from rest_framework import viewsets
from .models import Product
from .serializers import ProductSerializer

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ProductList(APIView):
    def post(self, request, format=None):
        serializer = ProductSerializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
