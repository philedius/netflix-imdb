import requests


titles = ["agent carter", "daredevil", "gravity"]
title_details = []

response = requests.get('https://www.googleapis.com/youtube/v3/search?part=id&maxResults=1&q='+ titles[1].replace(" ", "+") + ' trailer&key=AIzaSyC6akvC-Cwt0No3IO7uLDPkS8DCgCFIpIQ')
data = response.json()
print('https://www.youtube.com/embed/' + data['items'][0]['id']['videoId']  + '?autoplay=1')
