import json, requests
from bs4 import BeautifulSoup



with open('test.json', 'r') as f:
    json_data = json.load(f)
    counter = 0
    for item in json_data['items']:
        if counter % 10 == 0:
            print(str(counter) + ' of ' + str(len(json_data['items'])) + ' items done')
        q = item['Title'].lower().replace(' ', '_')
        try:
            if item['Type'] == 'movie':
                res = requests.get('https://www.rottentomatoes.com/m/' + q)
            elif item['Type'] == 'series':
                res = requests.get('https://www.rottentomatoes.com/tv/' + q)
        except requests.exceptions.RequestException as e:
            print e
            continue
        try:
            soup = BeautifulSoup(res.content, 'html.parser')
            tomato_meter = soup.find('span', {'class': 'meter-value'}).find('span').getText()
            item['Tomatometer'] = tomato_meter
        except:
            if item['Type'] == 'movie':
                res = requests.get('https://www.rottentomatoes.com/m/' + q + '-' + item['Year'])
            elif item['Type'] == 'series':
                res = requests.get('https://www.rottentomatoes.com/tv/' + q  + '-' + item['Year'])

            try:
                soup = BeautifulSoup(res.content, 'html.parser')
                tomato_meter = soup.find('span', {'class': 'meter-value'}).find('span').getText()
                item['Tomatometer'] = tomato_meter
            except:
                item['Tomatometer'] = 'N/A'
        counter += 1

with open('test.json', 'w') as f:
    f.write(json.dumps(json_data))
