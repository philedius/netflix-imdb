import json, requests
from bs4 import BeautifulSoup

def get_page_for_item(item, include_year):
    q = item['Title'].lower().replace(' ', '_')
    if include_year:
        q += '_' + item['Year']
    if item['Type'] == 'movie':
        res = requests.get('https://www.rottentomatoes.com/m/' + q)
    elif item['Type'] == 'series':
        res = requests.get('https://www.rottentomatoes.com/tv/' + q)
    return res

def get_tomatometer(item, res):
    soup = BeautifulSoup(res.content, 'html.parser')
    tomato_meter = soup.find('span', {'class': 'meter-value'}).find('span').getText()
    no_meter = soup.find('p', {'class': 'noReviewText'})
    if (no_meter == None):
        return tomato_meter
    else:
        return 'N/A'

with open('test.json', 'r') as f:
    json_data = json.load(f)
    counter = 0
    for item in json_data['items']:
        if counter % 100 == 0:
            print(str(counter) + ' of ' + str(len(json_data['items'])) + ' items done')
        if '100' in item['Tomatometer']:
            q = item['Title'].lower().replace(' ', '_')
            res = get_page_for_item(item, False)
            try:
                item['Tomatometer'] = get_tomatometer(item, res)
            except:
                res = get_page_for_item(item, True)
                try:
                    item['Tomatometer'] = get_tomatometer(item, res)
                except:
                    item['Tomatometer'] = 'N/A'
        counter += 1

with open('test.json', 'w') as f:
    f.write(json.dumps(json_data))
