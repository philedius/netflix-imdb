import requests, re, io, json
from bs4 import BeautifulSoup

res = requests.get('http://norway.netflixable.com/2017/03/complete-alphabetical-list-thu-mar-16.html')
soup = BeautifulSoup(res.content, 'html.parser')
content_list = []

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
            if content not in content_list:
                content_list.append(content)
    else:
        if content not in content_list:
            content_list.append(content)

content_data = {'items': content_list}

with io.open("netflix.json",'w',encoding="utf-8") as outfile:
    x = (json.dumps(content_data, ensure_ascii=False))
    if isinstance(x, str):
        x = unicode(x, 'UTF-8')
    outfile.write(x)
