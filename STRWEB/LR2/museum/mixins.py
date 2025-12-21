import re
from django.forms import ValidationError
from datetime import datetime
from museum.models import CustomUser


class ValidationMixin:
    def check_email(self, email: str) -> str:
        if CustomUser.objects.filter(email=email).exists():
            raise ValidationError("This email address is already registered.")
        return email

    def check_passwords(self, password1: str, password2: str) -> str:
        if password1 != password2:
            raise ValidationError("Passwords don't match")
        return password2

    def check_age(self, age: int) -> int:
        if age >= 18:
            return age
        raise ValidationError("Age must be greater than or equal to 18")

    def check_password_length(self, password1) -> str:
        if len(password1) < 8:
            raise ValidationError("Password len must be at least 8 letters or numbers")
        return password1

    def check_telephone(self, telephone: str) -> str:
        regex = r'\+375[0-9][0-9]\d{7}\b'
        if re.match(regex, telephone):
            return telephone

        raise ValidationError("Enter a valid telephone number +375********.")

    def check_datetime(self, form_datetime):
        if form_datetime is None:
            raise ValidationError("The datetime cannot be none.")
        if form_datetime < datetime.now():
            raise ValidationError("The datetime cannot be in the past.")
        return form_datetime
