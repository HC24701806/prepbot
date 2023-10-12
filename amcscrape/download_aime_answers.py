from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium import webdriver
from io import BytesIO
import os
import shutil
import numpy as np

options = Options()
options.add_argument("--headless")
options.add_argument("--window-size=1920,1080")
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option('useAutomationExtension', False)

s = Service('C:/Users/haoli/chromedriver.exe')
browser = webdriver.Chrome(service=s)
browser.maximize_window()

tests = []
for year in range(1983, 2023): #make list of tests
    if year < 2000:
        tests.append('%d_AIME' % year)
    else:
        tests.append('%d_AIME_I' % year)
        tests.append('%d_AIME_II' % year)

for test in tests:
    folderName = test[0:4] #folder name
    if year >= 2000:
        folderName += test[9:]
        
    f = open("C:/prepbot/amcscrape/AIME/%s/solutions.txt" % folderName, "w")
    url = "https://artofproblemsolving.com/wiki/index.php/%s_Answer_Key" % test
    browser.get(url)
    div = browser.find_element(By.CLASS_NAME, "mw-parser-output")
    elements = (element for element in div.find_elements(By.XPATH, "*"))
    if test != '2003_AIME_II':
        element = next(elements)

    try:
        element = next(elements)
        f.write(element.text)
        f.close()
    except KeyboardInterrupt:
        exit()
    except Exception as e:
        print(test)
        print("ERROR:", str(e))
        continue

browser.close()