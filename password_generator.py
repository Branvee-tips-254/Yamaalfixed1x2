import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random, string, datetime, json

YOUR_EMAIL = "branvee590@gmail.com"
APP_PASSWORD = "fwfj snws ddwk hokc"
PASSWORD_FILE = "password.json"

def make_password():
    letters = string.ascii_uppercase + string.digits
    return "YAMAAL" + ''.join(random.choice(letters) for _ in range(4))

def send_email(password, date):
    msg = MIMEMultipart()
    msg['From'] = YOUR_EMAIL
    msg['To'] = YOUR_EMAIL
    msg['Subject'] = f"Daily Password for {date}"
    msg.attach(MIMEText(f"Your login password for {date} is: {password}", 'plain'))

    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login(YOUR_EMAIL, APP_PASSWORD)
        server.send_message(msg)

def main():
    today = datetime.date.today().strftime("%d/%m/%Y")
    password = make_password()
    with open(PASSWORD_FILE, "w") as f:
        json.dump({"date": today, "password": password}, f)
    send_email(password, today)
    print(f"Password for {today}: {password}")

if __name__ == "__main__":
    main()