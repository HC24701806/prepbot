#based on code by ryanrudes on github
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium import webdriver
from PIL import Image
from io import BytesIO
import os
import shutil
import numpy as np

type = 12 #type of test
os.mkdir("C:/prepbot/amcscrape/AMC/%d/" % type)

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
        
    exam_path = "C:/prepbot/amcscrape/AMC/%d/%s/" % (type, folderName)
    os.mkdir(exam_path)
    for problem in range(1, 26):
        url = "https://artofproblemsolving.com/wiki/index.php/%s_Problems/Problem_%d" % (test, problem)
        browser.get(url)
        browser.execute_script("window.scrollTo(0, 200)") #scroll down to avoid screenshotting out of bounds
        try: #screenshotting; make screenshots line by line and then stack together
            div = browser.find_element(By.CLASS_NAME, "mw-parser-output")
            elements = (element for element in div.find_elements(By.XPATH, "*"))
            while next(elements).tag_name != "h2":
                pass

            ims = []
            while True:
                element = next(elements)
                if element.tag_name == "h2":
                    break
                
                location = element.location
                size = element.size
                png = browser.get_screenshot_as_png()
                im = Image.open(BytesIO(png))
                screensize = (browser.execute_script("return document.body.clientWidth"), browser.execute_script("return window.innerHeight"))
                im = im.resize(screensize)
                
                left = location['x'] - 10
                top = location['y'] - 200
                if len(ims) == 0:
                    top -= 10
                right = location['x'] + size['width'] + 10
                bottom = location['y'] + size['height'] - 190
                im = im.crop((left, top, right, bottom))
                ims.append(im)
            image = np.vstack([np.asarray(im) for im in ims])
            image = Image.fromarray(image)
            image.save(exam_path + str(problem) + ".png")
        except KeyboardInterrupt:
            exit()
        except Exception as e:
            print(test + ' ' + str(problem))
            print("ERROR:", str(e))
            continue

browser.close()