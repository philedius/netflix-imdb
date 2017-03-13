import requests, re
from bs4 import BeautifulSoup

res = requests.get('http://norway.netflixable.com/2017/02/complete-alphabetical-list-wed-mar-1.html')
soup = BeautifulSoup(res.content, 'html.parser')


for listing in soup.find_all('b'):
    content = listing.get_text().encode('utf-8')
    if 'Season' not in content:
        content = re.sub(r'\([^()]*\)', '', content)
        print('\"' + content + '\",')
