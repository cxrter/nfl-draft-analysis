from requests import get
from bs4 import BeautifulSoup
import pandas as pd
import numpy as np


class PfrDraftData:

    def __init__(self, year):
        self.year = year
        self.url = f'https://pro-football-reference.com/years/{self.year}/draft.htm'

    def get_data(self):
        response = get(self.url)
        draft_scrape = BeautifulSoup(response.content, 'html.parser')

        draft_table = draft_scrape.find(id='drafts')  # get the table element

        table_elements = draft_table.find_all('tbody')  # main data is in the table body
        table_data = []  # initialise empty list
        data_rows = table_elements[0].find_all('tr', attrs={'class': ''})
        for data_row in data_rows:  # for each row in the table
            row_data = {}  # initialise empty dictionary

            for th in data_row:
                col = th.get('data-stat')
                values = th.text
                ahref = th.find('a')

                if ahref and col in ['player']:
                    row_data['pfr_player_url'] = ahref.get('href')

                if ahref and col in ['team']:
                    row_data['team_name'] = ahref.get('title')
                    row_data['short_name'] = ahref.get('title').split(' ')[-1]

                row_data[col] = values

            # get years spent  with drafting team
            if len(row_data['year_max']) == 0:
                row_data['year_max'] = self.year
            row_data['years_with_team'] = (int(row_data['year_max']) - self.year) + 1  # +1 needed to inc final year

            table_data.append(row_data)  # append dictionary to list

        return pd.DataFrame(table_data)


dates = list(range(2010, 2020))  # this is not inclusive ! (2018,2019) gives [2018]
data = pd.DataFrame({})
for yr in dates:
    yr_data = PfrDraftData(yr).get_data()
    data = data.append(yr_data, ignore_index=True)


# add colors
colors = pd.read_csv('nfl_team_colors.csv')
pfr_draft_data = pd.merge(data, colors, how='left', on='team_name')

# get modern 3 letter code - manual mapping
modern_teams = {'STL': 'LAR', 'SDG': 'LAC'}
pfr_draft_data['modern_code'] = pfr_draft_data['team'].replace(modern_teams)

offense_positions = ['C', 'FB', 'G', 'OL', 'OLB', 'QB', 'RB', 'T', 'TE']
defense_positions = ['CB', 'DB', 'DE', 'DL', 'DT', 'ILB', 'LB', 'NT', 'S']
special_teams = ['K', 'P', 'LS']
pfr_draft_data['squad'] = np.where(pfr_draft_data['pos'].isin(offense_positions), 'offense', np.nan)
pfr_draft_data['squad'] = np.where(pfr_draft_data['pos'].isin(defense_positions), 'defense', pfr_draft_data['squad'])
pfr_draft_data['squad'] = np.where(pfr_draft_data['pos'].isin(special_teams), 'special', pfr_draft_data['squad'])


pfr_draft_data.to_csv('pfr_draft_data.csv')
