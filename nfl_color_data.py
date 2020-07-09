from requests import get
from bs4 import BeautifulSoup
from cssutils import parseStyle
import pandas as pd


class TeamColorCodes:
    def __init__(self):
        self.url = f'https://teamcolorcodes.com/nfl-team-color-codes/'

    def get_colors(self):
        response = get(self.url)
        color_scrape = BeautifulSoup(response.content, 'html.parser')
        color_table = color_scrape.find_all('div', {'class': 'entry-content'})  # get the table element
        data_rows = color_table[0].find_all('p')  # main data is in the table body

        table_data = []
        for a in data_rows[0]:
            row_data = {}

            style = parseStyle(a['style'])
            row_data['team_name'] = a.text
            row_data['color_primary'] = str(style['background-color'])
            row_data['color_secondary'] = str(style['border-bottom']).split(' ')[2]

            table_data.append(row_data)

        return pd.DataFrame(table_data)


colors = TeamColorCodes().get_colors()

# manual colors for old teams
cols = {'team_name': ['St. Louis Rams', 'San Diego Chargers'], 'color_primary': ['#003594', '#002A5E'],
        'color_secondary': ['#FFA300', '#FFC20E']}
historical_colors = pd.DataFrame(cols)

colors = colors.append(historical_colors, ignore_index=True)

colors.to_csv('nfl_team_colors.csv')
