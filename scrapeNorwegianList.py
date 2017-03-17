import requests, re
from bs4 import BeautifulSoup

res = requests.get('http://norway.netflixable.com/2017/03/complete-alphabetical-list-thu-mar-16.html')
soup = BeautifulSoup(res.content, 'html.parser')
content_list = []

for listing in soup.find_all('b'):
    content = listing.get_text().encode('utf-8')
    content = re.sub(r'\([^()]*\)', '', content)
    content = content.split(',', 1)[0]
    content = content.strip()
    if 'Season' in content or 'Series' in content:
        if 'Season 1' in content or 'Series 1' in content:
            # content = content.split(' -', 1)[0]
            if content not in content_list:
                content_list.append(content)
                print('\"' + content + '\",')
    else:
        if content not in content_list:
            content_list.append(content)
            print('\"' + content + '\",')
