# products/serializers.py
from rest_framework import serializers
from .models import Plant, Product, ProductParameter, LabReport, LabReportParameter
from django.contrib.auth import get_user_model

User = get_user_model()

class PlantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plant
        fields = ['id', 'name']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'product_id', 'name', 'plant']

class ProductParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductParameter
        fields = ['id', 'name', 'type', 'unit', 'required', 'min_value', 'max_value', 'options', 'product']

class LabReportParameterSerializer(serializers.ModelSerializer):
    parameter_name = serializers.CharField(source='parameter.name', read_only=True)
    unit = serializers.CharField(source='parameter.unit', read_only=True, allow_null=True)

    class Meta:
        model = LabReportParameter
        fields = ['parameter', 'parameter_name', 'value', 'unit']

class LabReportSerializer(serializers.ModelSerializer):
    parameter_values = LabReportParameterSerializer(many=True, required=False)
    product_name = serializers.CharField(source='product.name', read_only=True)
    submitted_by_username = serializers.CharField(source='submitted_by.username', read_only=True)
    approved_by_username = serializers.CharField(source='approved_by.username', read_only=True, allow_null=True)

    class Meta:
        model = LabReport
        fields = [
            'id', 'product', 'product_name', 'batch_no', 'submitted_by', 'submitted_by_username',
            'submitted_at', 'approved_by', 'approved_by_username', 'approved_at', 'status', 'parameter_values'
        ]
        extra_kwargs = {
            "submitted_by": {"required": False},
        }

    def create(self, validated_data):
        parameter_values_data = validated_data.pop('parameter_values', [])
        lab_report = LabReport.objects.create(**validated_data)
        for param_data in parameter_values_data:
            LabReportParameter.objects.create(lab_report=lab_report, **param_data)
        return lab_report

    def update(self, instance, validated_data):
        parameter_values_data = validated_data.pop('parameter_values', [])
        instance.product = validated_data.get('product', instance.product)
        instance.batch_no = validated_data.get('batch_no', instance.batch_no)
        instance.status = validated_data.get('status', instance.status)
        instance.approved_by = validated_data.get('approved_by', instance.approved_by)
        instance.approved_at = validated_data.get('approved_at', instance.approved_at)
        instance.save()

        # Update parameter values if provided
        if parameter_values_data:
            instance.parameter_values.all().delete()
            for param_data in parameter_values_data:
                LabReportParameter.objects.create(lab_report=instance, **param_data)
        return instance