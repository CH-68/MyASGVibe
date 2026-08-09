# --- PII Safeguard Imports ---
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine
import hashlib

# --- PII Safeguard Setup ---
# Set up the engine for detecting PII entities.
analyzer = AnalyzerEngine()
# Set up the engine for anonymizing the detected PII entities.
anonymizer = AnonymizerEngine()

# --- Password Hashing ---
# Store the SHA-256 hash of the password "admin"
PASSWORD_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"

def anonymize_text(input_text: str) -> str:
    """
    Analyzes and anonymizes text to remove PII using Presidio.
    """
    analyzer_results = analyzer.analyze(
        text=input_text,
        entities=["PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "LOCATION", "NRP"],
        language="en",
    )
    anonymized_result = anonymizer.anonymize(text=input_text, analyzer_results=analyzer_results)
    return anonymized_result.text

def check_password(password: str) -> bool:
    """
    Verifies the provided password against the stored hash.
    """
    if not password:
        return False
    return hashlib.sha256(password.encode()).hexdigest() == PASSWORD_HASH