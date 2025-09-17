from django.contrib import admin
from .models import *
from django.contrib import admin
from .models import Hall
from django.contrib import admin
from .models import Company, CompanyHistory, CompanyRequisite, CompanyCertificate

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'website', 'created_at']
    list_filter = ['created_at']

@admin.register(CompanyHistory)
class CompanyHistoryAdmin(admin.ModelAdmin):
    list_display = ['year', 'title', 'company']
    list_filter = ['year', 'company']
    search_fields = ['title', 'description']

@admin.register(CompanyRequisite)
class CompanyRequisiteAdmin(admin.ModelAdmin):
    list_display = ['title', 'value', 'company']
    list_filter = ['company']
    search_fields = ['title', 'value']

@admin.register(CompanyCertificate)
class CompanyCertificateAdmin(admin.ModelAdmin):
    list_display = ['title', 'issue_date', 'company']
    list_filter = ['issue_date', 'company']
    search_fields = ['title', 'description']
    
@admin.register(PartnerCompany)
class PartnerCompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'website', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'website')
    readonly_fields = ('created_at',)

admin.site.register(News)
admin.site.register(Question)
admin.site.register(Answer)
admin.site.register(Vacancy)
admin.site.register(Review)
admin.site.register(PromoCode)
admin.site.register(Bonus)
admin.site.register(Order)
admin.site.register(Hall)
admin.site.register(Employee)
admin.site.register(Exhibit)
admin.site.register(EmployeePosition)
admin.site.register(Exhibitions)
admin.site.register(Art_form)
admin.site.register(CustomUser)
admin.site.register(Client)