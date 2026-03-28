from django.apps import AppConfig
from .initializetables import initialize_tables
import os

class CreativeAgencyConfig(AppConfig):
    name = 'creative_agency'

    def ready(self):
        if os.environ.get('RUN_MAIN') == 'true':
            initialize_tables()