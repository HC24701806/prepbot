from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium import webdriver
from io import BytesIO
import os
import shutil
import numpy as np

type = 12

options = Options()
options.add_argument("--headless")
options.add_argument("--window-size=1920,1080")
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option('useAutomationExtension', False)

s = Service('C:/Users/haoli/chromedriver.exe')
browser = webdriver.Chrome(service=s)
browser.maximize_window()

tests = []
for year in range(2000, 2023): #make list of tests
    if year < 2002:
        tests.append('%d_AMC_%d' % (year, type))
    elif year != 2021:
        tests.append('%d_AMC_%dA' % (year, type))
        tests.append('%d_AMC_%dB' % (year, type))
    else:
        tests.append('%d_AMC_%dA' % (year, type))
        tests.append('%d_AMC_%dB' % (year, type))
        tests.append('%d_Fall_AMC_%dA' % (year, type))
        tests.append('%d_Fall_AMC_%dB' % (year, type))

for test in tests:
    folderName = test[0:4] #make folder name
    year = int(test[0:4])
    if year == 2021:
        if test[5] == 'F':
            folderName += '_Fall'
        else:
            folderName += '_Spring'
    if year >= 2002:
        folderName += ('_' + test[-1])
        
    f = open("C:/prepbot/amcscrape/AMC/%d/%s/solutions.txt" % (type, folderName), "w")
    url = "https://artofproblemsolving.com/wiki/index.php/%s_Answer_Key" % test
    browser.get(url)
    div = browser.find_element(By.CLASS_NAME, "mw-parser-output")
    elements1 = (element for element in div.find_elements(By.XPATH, "*"))
    elements = (element for element in div.find_elements(By.XPATH, "*"))
    
    try:
        for problem in range(1, 26):
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