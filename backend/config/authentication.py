from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication that skips the CSRF check for API endpoints.
    Allows decoupled SPAs (e.g. hosted on Vercel) using session cookies
    to perform state-mutating requests (POST, PUT, DELETE) without
    DRF enforcing strict CSRF validation.
    """
    def enforce_csrf(self, request):
        return  # Skip CSRF enforcement

