from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, PlantViewSet, ProductParameterViewSet, LabReportViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='products')  
router.register(r'plants', PlantViewSet, basename='plants')  
router.register(r'parameters', ProductParameterViewSet, basename='parameters')  
router.register(r'lab-reports', LabReportViewSet, basename='lab-reports')

urlpatterns = [
    path("", include(router.urls)),
]