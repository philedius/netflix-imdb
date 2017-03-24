# encoding=utf8
import requests, re, io, json
from bs4 import BeautifulSoup
old_data_json = 'test_copy.json'


def scrape_alpabetical_netflix_list(url):
    items = []
    res = requests.get(url)
    soup = BeautifulSoup(res.content, 'html.parser')
    for listing in soup.find_all('b'):
        content = listing.get_text().encode('utf-8')
        # content = re.sub(r'\([^()]*\)', '', content)
        year_pattern = re.search('\((\d{4})+\)', content)
        if year_pattern:
            content = content.split(' (')[0]
            year = year_pattern.group(1)
        else:
            year = ''
        content = content.split(',', 1)[0]
        content = content.strip()
        if 'best' in content:
            continue
        if 'Season' in content or 'Series' in content:
            content = content.split(' - S', 1)[0]
            if 'Marvel\'s' in content:
                content = content.split('Marvel\'s ', 1)[1]
        if content not in items:
            items.append((content, year))
            print (content, year)
    return items

def fetch_data():
    with io.open(old_data_json, encoding="utf-8") as json_data:
        old_data = json.load(json_data)
        counter = 0
        old_counter = 0
        new_items = []
        title_details = []
        for item in content_list:
            item_year = item[1]
            item = item[0]
            counter += 1
            item_is_new = True
            for old_item in old_data['items']:
                if item.decode('utf-8') in old_item['Title']:
                    old_counter += 1
                    item_is_new = False
                    break
            # if counter > 100:
            #     break;
            print_status(counter, len(content_list))
            if item_is_new:
                try:
                    response = requests.get('http://www.omdbapi.com/?t=' + item.replace(' ', '+') + '&y=' + item_year)
                    data = response.json()
                except:
                    print 'OMDB error'
                    continue

                if 'False' not in data['Response'] and 'N/A' not in data['imdbVotes']:
                    try:
                        response = requests.get('https://www.googleapis.com/youtube/v3/search?part=id&maxResults=1&q='+ data['Title'].replace(" ", "+") + item_year + ' trailer&key=AIzaSyC6akvC-Cwt0No3IO7uLDPkS8DCgCFIpIQ')
                        trailer = response.json()
                        trailer_link = 'https://www.youtube.com/embed/' + trailer['items'][0]['id']['videoId']  + '?autoplay=1'
                        data['Trailer'] = trailer_link
                    except:
                        print 'Youtube error'
                        continue
                    new_items.append(data)
                    title_details.append(data)
        print 'New items: ' + str(len(new_items)) + ' Old items: ' + str(old_counter)
        for item in new_items:
            print item['Title'].encode('raw_unicode_escape')
        return {'items': title_details}

def print_status(counter, length):
    if counter % 10 == 0:
        print(str(counter) + ' of ' + str(length) + ' items done')

def write_data_to_json(content_data):
    a = {}
    with open(old_data_json, 'r') as old_file:
        a = json.load(old_file)

    with open(old_data_json, 'w') as outfile:
        for item in content_data['items']:
            a['items'].append(item)
        json.dump(a, outfile)


content_list = scrape_alpabetical_netflix_list('http://norway.netflixable.com/2017/03/complete-alphabetical-list-thu-mar-16.html')
content_data = fetch_data()
write_data_to_json(content_data)
