
# Required Dependencies

1. **Python**  
   Ensure you have Python 3.10 installed on your system. If not, download it from [python.org](https://python.org).

2. **Node.js**  
   You will also need Node.js . Download it from [nodejs.org](https://nodejs.org).

3. **MySQL Server**  
   Make sure you have MySQL Server installed and running. You can download MySQL from [dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/).

# Project Setup

### Step 1: Clone the Repository
Start by cloning the repository to your local machine:

```bash
git clone https://github.com/your-repo/GSFCLTD-TRIAL.git
cd GSFCLTD-TRIAL
```

### Step 2: Set Up the Python Virtual Environment
Create a virtual environment for Python to manage dependencies:

```bash
python -m venv venv
```

**Windows** (Use the following command to activate the virtual environment):
```bash
.venv/Scripts/activate
```

**MacOS/Linux:**
```bash
source venv/bin/activate
```

### Step 3: Install Backend Dependencies
Navigate to the backend directory and install the required Python dependencies:

```bash
cd backend
pip install -r requirements.txt
```

### Step 4: Configure the Database
Before applying migrations, you need to configure the database settings in the `settings.py` file.

Open `backend/lab_portal/settings.py`.

Modify the `DATABASES` settings section to match your local MySQL setup:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'GSFCLTD_Trial',  # Update this with your database name
        'USER': 'root',           # Update with your MySQL username
        'PASSWORD': 'root',       # Update with your MySQL password
        'HOST': 'localhost',      # Use 'localhost' or your MySQL server IP
        'PORT': '3306',           # Default MySQL port
    }
}
```

### Step 5: Create Users in the Django Shell
Run the Django shell:

```bash
python manage.py shell
```

Paste the following code to create the necessary users:

```python
from reports.models import CustomUser

# Create Lab Assistants (lab1 - lab5)
for i in range(1, 6):
    CustomUser.objects.create_user(username=f"lab{i}", password="pass", role="lab_assistant")

# Create Supervisors (sup1 - sup3)
for i in range(1, 4):
    CustomUser.objects.create_user(username=f"sup{i}", password="pass", role="supervisor")

# Create Managers (man1, man2)
for i in range(1, 3):
    CustomUser.objects.create_user(username=f"man{i}", password="pass", role="manager")

print("✅ Users created successfully!")
```

### Step 6: Apply Migrations
Run the following commands to apply the database migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 7: Start the Django Development Server
Run the following command to start the Django development server:
Navigate to the `backend/lab_portal/` directory:
```bash
python manage.py runserver
```

### Step 8: Set Up the Frontend
Open a new terminal window from the project’s root directory (`GSFCLTD-TRIAL`).

Navigate to the `gsfclt` directory:

```bash
cd gsfclt
```

Install the necessary frontend dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

# Default User Credentials
Here are the default usernames and passwords for logging into the application:

**Lab Assistants:**  
- Username: `lab1`  
- Password: `pass`  

**Supervisors:**  
- Username: `sup1`  
- Password: `pass`  

**Managers:**  
- Username: `man1`  
- Password: `pass`