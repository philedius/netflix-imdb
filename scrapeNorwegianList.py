# encoding=utf8
import requests, re, io, json
from bs4 import BeautifulSoup
old_data_json = 'test.json'

def scrape_netflix_list(url):
    items = []
    res = requests.get(url)
    soup = BeautifulSoup(res.content, 'html.parser')
    for listing in soup.find_all('b'):
        content = listing.get_text().encode('utf-8')
        content = re.sub(r'\([^()]*\)', '', content)
        content = content.split(',', 1)[0]
        content = content.strip()
        if 'best' in content:
            continue
        if 'Season' in content or 'Series' in content:
            if 'Season 1' in content or 'Series 1' in content:
                content = content.split(' - S', 1)[0]
                if 'Marvel\'s' in content:
                    content = content.split('Marvel\'s ', 1)[1]
        if content not in items:
            items.append(content)
    return items

def fetch_data():
    with io.open(old_data_json, encoding="utf-8") as json_data:
        old_data = json.load(json_data)
        counter = 0
        new_counter = 0
        old_counter = 0
        title_details = []
        for item in content_list:
            counter += 1
            item_is_new = True
            for old_item in old_data['items']:
                # if type(item) != unicode and type(old_item['Title']) != unicode:
                if item.decode('utf-8') in old_item['Title']:
                    old_counter += 1
                    item_is_new = False
                    break
            # if counter > 100:
            #     break;
            if counter % 10 == 0:
                print(str(counter) + ' of ' + str(len(content_list)) + ' items done')
            if item_is_new:
                try:
                    response = requests.get('http://www.omdbapi.com/?t=' + item.replace(' ', '+'))
                    data = response.json()
                except:
                    print 'OMDB error'
                    continue

                if 'False' not in data['Response'] and 'N/A' not in data['imdbVotes']:
                    try:
                        response = requests.get('https://www.googleapis.com/youtube/v3/search?part=id&maxResults=1&q='+ data['Title'].replace(" ", "+") + ' trailer&key=AIzaSyC6akvC-Cwt0No3IO7uLDPkS8DCgCFIpIQ')
                        trailer = response.json()
                        trailer_link = 'https://www.youtube.com/embed/' + trailer['items'][0]['id']['videoId']  + '?autoplay=1'
                        data['Trailer'] = trailer_link
                    except:
                        print 'Youtube error'
                        continue
                    new_counter += 1
                    title_details.append(data)
        print 'New items: ' + str(new_counter) + ' Old items: ' + str(old_counter)
        return {'items': title_details}

# def write_data_to_json(content_data):
#     with io.open('test2.json','w',encoding='utf-8') as outfile:
#         x = (json.dumps(content_data, ensure_ascii=False))
#         if isinstance(x, str):
#             x = unicode(x, 'UTF-8')
#         outfile.write(x)

def write_data_to_json(content_data):
    a = {}
    with open(old_data_json, 'r') as old_file:
        a = json.load(old_file)

    with open(old_data_json, 'w') as outfile:
        for item in content_data['items']:
            a['items'].append(item)
        json.dump(a, outfile)


content_list = scrape_netflix_list('http://norway.netflixable.com/2017/03/complete-alphabetical-list-thu-mar-16.html')
content_data = fetch_data()
write_data_to_json(content_data)
