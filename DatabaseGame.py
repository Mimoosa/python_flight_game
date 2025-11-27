import mysql.connector
from geopy.distance import geodesic

class Database:
    def __init__(self):
        self.airports_list = []

    def open_db_connection(self):
        try:
            self.yhteys = mysql.connector.connect(
                host='localhost',
                user='root',
                password='Mooimoipuipoi8181',
                database='peliprojekti3',
                autocommit=True
            )
        except mysql.connector.Error as e:
            print("Error in database connection:", e)

    def close_db_connection(self):
        self.yhteys.close()

    # Haetaan pelaajien tulostiedot tietokannasta
    def get_player_scores(self):
        self.open_db_connection()
        if self.yhteys:
            try:
                cursor = self.yhteys.cursor(dictionary=True)
                cursor.execute(
                    "SELECT screen_name, aircraft, final_location, score FROM player_scores ORDER BY score DESC LIMIT 5")
                player_scores = cursor.fetchall()
                self.close_db_connection()
                return player_scores
            except mysql.connector.Error as e:
                print("Error in database query:", e)
                self.close_db_connection()
                return None
        else:
            return None

    def save_player_score(self, screen_name, aircraft_name, final_location, score):
        self.open_db_connection()
        if self.yhteys:
            try:
                sql = ("INSERT INTO player_scores (screen_name, aircraft, final_location, score) "
                       "VALUES (%s, %s, %s, %s)")
                cursor = self.yhteys.cursor()
                cursor.execute(sql, (screen_name, aircraft_name, final_location, score))
                self.close_db_connection()
            except mysql.connector.Error as e:
                print("Error in database query:", e)
                self.close_db_connection()


    def random_airport(self):
        self.open_db_connection()
        if self.yhteys:
            try:
                sql = """
                    SELECT airport.iso_country, airport.ident, airport.name, airport.type, airport.latitude_deg, airport.longitude_deg, country.name
                    FROM airport
                    JOIN country ON airport.iso_country = country.iso_country
                    WHERE airport.continent = 'EU'
                    AND airport.TYPE IN ('large_airport', 'medium_airport', 'small_airport')"""
                cursor = self.yhteys.cursor()
                cursor.execute(sql)
                airports = cursor.fetchall()
                self.close_db_connection()
                if not self.airports_list:
                    self.airports_list = airports
                return airports
            except mysql.connector.Error as e:
                print("Error in database query:", e)
                self.close_db_connection()
                return None
        else:
            return None

    def nearest_airport(self, airport, airports, type, visited_aps):
        your_location = (airport[1], airport[2])
        airports = [a for a in airports if a[0] != airport[0] and a[1] not in visited_aps]
        distances = [(a, geodesic(your_location, (a[4], a[5])).kilometers) for a in airports if a[3] == type]
        nearest_airport = min(distances, key=lambda x: x[1])
        return nearest_airport