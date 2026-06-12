from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.conf import settings
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer

def set_jwt_cookies(response, refresh_token):
    secure = not settings.DEBUG
    response.set_cookie(
        key='refresh_token',
        value=str(refresh_token),
        httponly=True,
        samesite='Lax',
        secure=secure,
        max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())
    )

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        response = Response({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            },
            "access": access,
            "refresh": str(refresh)
        }, status=status.HTTP_201_CREATED)
        
        set_jwt_cookies(response, refresh)
        return response

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(email=email, password=password)
        if user is None:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        response = Response({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            },
            "access": access,
            "refresh": str(refresh)
        }, status=status.HTTP_200_OK)

        set_jwt_cookies(response, refresh)
        return response

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token and 'refresh' not in data:
            data['refresh'] = refresh_token
        
        serializer = self.get_serializer(data=data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        response = Response(serializer.validated_data, status=status.HTTP_200_OK)

        new_refresh = serializer.validated_data.get('refresh')
        if new_refresh:
            set_jwt_cookies(response, new_refresh)
            
        return response

class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token') or request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass
        
        response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        response.delete_cookie('refresh_token')
        return response

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "created_at": user.created_at
        })
