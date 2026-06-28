from twilio.rest import Client
from django.conf import settings

def send_status_sms(phone, body_content):
    if not phone:
        return None
    try:
        client = Client(
            settings.TWILIO_ACCOUNT_SID,
            settings.TWILIO_AUTH_TOKEN
        )

        message = client.messages.create(
            body=body_content,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone
        )
        return message.sid
    except Exception as e:
        print("Twilio SMS Dispatch Error:", str(e))
        return None