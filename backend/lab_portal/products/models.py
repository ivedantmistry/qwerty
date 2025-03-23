# products/models.py
from django.db import models
from django.utils.timezone import now
from django.conf import settings

# 1️⃣ Plant Model (e.g., "Plant 1", "Plant 2")
class Plant(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

# 2️⃣ Product Model (linked to a plant)
class Product(models.Model):
    product_id = models.CharField(max_length=50, unique=True) 
    name = models.CharField(max_length=100)
    plant = models.ForeignKey(Plant, on_delete=models.CASCADE, related_name="products")

    def __str__(self):
        return f"{self.product_id} - {self.name}"

# 3️⃣ Product Parameter Model (Stores parameters like H2O %, NH2, etc.)
class ProductParameter(models.Model):
    PARAMETER_TYPES = [
        ('number', 'Number'),
        ('text', 'Text'),
        ('dropdown', 'Dropdown'),
        ('boolean', 'Boolean'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="parameters")
    name = models.CharField(max_length=100)  # e.g., "H2O %", "NH2"
    type = models.CharField(max_length=20, choices=PARAMETER_TYPES, default='text')
    unit = models.CharField(max_length=20, blank=True, null=True)  # e.g., "%", "mg/L"
    required = models.BooleanField(default=True)
    min_value = models.FloatField(blank=True, null=True)
    max_value = models.FloatField(blank=True, null=True)
    options = models.JSONField(blank=True, null=True)  # For dropdown options

    def __str__(self):
        return f"{self.name} ({self.product.name})"

# 4️⃣ Lab Report Model
class LabReport(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    batch_no = models.CharField(max_length=50)
    submitted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='approved_reports')
    approved_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"Lab Report for {self.product.name} (Batch: {self.batch_no})"

# 5️⃣ Lab Report Parameter Model
class LabReportParameter(models.Model):
    lab_report = models.ForeignKey('LabReport', on_delete=models.CASCADE, related_name='parameter_values')
    parameter = models.ForeignKey('ProductParameter', on_delete=models.CASCADE)
    value = models.CharField(max_length=255)

    class Meta:
        unique_together = ('lab_report', 'parameter')

    def __str__(self):
        return f"{self.parameter.name}: {self.value} (Lab Report {self.lab_report.id})"