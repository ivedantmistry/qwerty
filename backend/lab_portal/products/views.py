# products/views.py
from rest_framework import viewsets, permissions
from .models import Plant, Product, ProductParameter, LabReport
from .serializers import (
    PlantSerializer, ProductSerializer, ProductParameterSerializer, LabReportSerializer
)
from django.utils import timezone

class PlantViewSet(viewsets.ModelViewSet):
    queryset = Plant.objects.all()
    serializer_class = PlantSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProductParameterViewSet(viewsets.ModelViewSet):
    queryset = ProductParameter.objects.all()
    serializer_class = ProductParameterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        product_id = self.request.query_params.get('product_id', None)
        if product_id:
            return ProductParameter.objects.filter(product_id=product_id)
        return ProductParameter.objects.all()

class LabReportViewSet(viewsets.ModelViewSet):
    queryset = LabReport.objects.all()
    serializer_class = LabReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = LabReport.objects.all()
        # Filter by status if provided in query params
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        return queryset

    def perform_create(self, serializer):
        # Automatically set submitted_by to the current user
        serializer.save(submitted_by=self.request.user)

    def perform_update(self, serializer):
        # Automatically set approved_by and approved_at when status is updated to approved or rejected
        if 'status' in self.request.data and self.request.data['status'] in ['approved', 'rejected']:
            serializer.save(
                approved_by=self.request.user,
                approved_at=timezone.now()  # Explicitly set approved_at
            )
        else:
            serializer.save()