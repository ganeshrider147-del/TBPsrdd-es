import logging
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer, UserSerializer

logger = logging.getLogger(__name__)


# ---------------------------
# REGISTER
# ---------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            # Add custom claims
            refresh['username'] = user.username
            refresh['email'] = user.email
            refresh['is_staff'] = user.is_staff

            logger.info(f"New user registered: {user.username} ({user.email})")
            return Response({
                'message': 'Account created successfully.',
                'user': UserSerializer(user).data,
            }, status=201)
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return Response({'error': str(e)}, status=400)
    return Response(serializer.errors, status=400)


# ---------------------------
# LOGIN (JWT)
# ---------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()

    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=400)

    user = authenticate(username=username, password=password)

    if not user:
        # Try email-based login
        try:
            user_obj = User.objects.get(email=username)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass

    if not user:
        return Response({'error': 'Invalid credentials. Please try again.'}, status=401)

    if not user.is_active:
        return Response({'error': 'Account is disabled. Please contact support.'}, status=403)

    refresh = RefreshToken.for_user(user)
    # Embed custom claims into the token payload
    refresh['username'] = user.username
    refresh['email'] = user.email
    refresh['is_staff'] = user.is_staff

    logger.info(f"User logged in: {user.username}")
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data,
    })


# ---------------------------
# ME — Get current user profile
# ---------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


# ---------------------------
# MY COMPLAINTS — Filter by logged-in user
# ---------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_complaints(request):
    from complaints.models import Complaint
    from complaints.serializers import ComplaintSerializer

    complaints = Complaint.objects.filter(user=request.user).order_by('-created_at')
    serializer = ComplaintSerializer(complaints, many=True, context={'request': request})
    return Response(serializer.data)


# ---------------------------
# UPDATE PROFILE
# ---------------------------
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    profile, created = UserProfile.objects.get_or_create(user=user)
    
    email = request.data.get('email')
    if email:
        user.email = email
        user.save()
        
    profile.full_name = request.data.get('full_name', profile.full_name)
    profile.phone_number = request.data.get('phone_number', profile.phone_number)
    profile.location = request.data.get('location', profile.location)
    profile.department = request.data.get('department', profile.department)
    profile.designation = request.data.get('designation', profile.designation)
    profile.save()
    
    return Response(UserSerializer(user).data)


# ---------------------------
# CHANGE PASSWORD
# ---------------------------
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response({'error': 'Both old and new passwords are required.'}, status=400)
        
    if not user.check_password(old_password):
        return Response({'error': 'Incorrect current password.'}, status=400)
        
    if len(new_password) < 6:
        return Response({'error': 'New password must be at least 6 characters.'}, status=400)
        
    user.set_password(new_password)
    user.save()
    
    logger.info(f"Password changed for user: {user.username}")
    return Response({'message': 'Password updated successfully.'})
