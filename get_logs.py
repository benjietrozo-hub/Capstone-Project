from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import json

options = Options()
options.add_argument('--headless')
options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
driver = webdriver.Chrome(options=options)

driver.get('http://localhost:5173/login')
time.sleep(2)

driver.execute_script("document.querySelector('input[type=\"email\"]').value = 'admin@example.com';")
driver.execute_script("document.querySelector('input[type=\"password\"]').value = 'p@ssw0rd';")
driver.execute_script("document.querySelector('button[type=\"submit\"]').click();")
time.sleep(3)

driver.get('http://localhost:5173/admin/inventory')
time.sleep(3)

print("Admin console logs:")
for entry in driver.get_log('browser'):
    if entry['level'] == 'SEVERE':
        print(entry)

driver.get('http://localhost:5173/login')
time.sleep(2)

driver.execute_script("document.querySelector('input[type=\"email\"]').value = 'neilbryant.galindez@csucc.edu.ph';")
driver.execute_script("document.querySelector('input[type=\"password\"]').value = 'Galindez2@';")
driver.execute_script("document.querySelector('button[type=\"submit\"]').click();")
time.sleep(3)

driver.get('http://localhost:5173/teacher/inventory')
time.sleep(3)

print("Teacher console logs:")
for entry in driver.get_log('browser'):
    if entry['level'] == 'SEVERE':
        print(entry)

driver.quit()
