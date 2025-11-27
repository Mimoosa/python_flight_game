from DatabaseGame import Database
from weathercondition import Weather
from flask import Flask, Response, request, jsonify, render_template
import json
from flask_cors import CORS
import random
import mysql.connector


db = Database()
weather = Weather()

app = Flask(__name__,template_folder='./templates',static_folder='./static')
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
@app.route('/first_airport')
def first_airport():
    aps = db.random_airport()
    airport_result = random.choice(aps)

    if airport_result:
        response = {
            "iso_country": airport_result[0],
            "icao": airport_result[1],
            "airport_name": airport_result[2],
            "latitude": airport_result[4],
            "longitude": airport_result[5],
            "country": airport_result[6]
        }

    json_response = json.dumps(response)
    return Response(response=json_response, mimetype="application/json")

@app.route('/destinations/<iso_country>/<icao>/<ap_name>/<latitude>/<longitude>/<country>/<visited_a_ports>')
def destinations(iso_country, icao, ap_name, latitude, longitude, country, visited_a_ports):
    first_ap_cdnts = [iso_country, float(latitude), float(longitude)]
    small_ap = db.nearest_airport(first_ap_cdnts, db.airports_list,'small_airport', visited_a_ports)
    medium_ap = db.nearest_airport(first_ap_cdnts, db.airports_list, 'medium_airport', visited_a_ports)
    large_ap = db.nearest_airport(first_ap_cdnts, db.airports_list, 'large_airport', visited_a_ports)

    if small_ap and medium_ap and large_ap:
        response = [{
            "icao": icao,
            "country": country,
            "airport_name": ap_name,
            "latitude": latitude,
            "longitude": longitude,
            "active": True
         }, {
            "iso_country":small_ap[0][0],
            "icao":small_ap[0][1],
            "country": small_ap[0][6],
            "airport_name": small_ap[0][2],
            "latitude": small_ap[0][4],
            "longitude": small_ap[0][5],
            "type": "small",
            "distance": small_ap[1]
         }, {
            "iso_country": medium_ap[0][0],
            "icao": medium_ap[0][1],
            "country": medium_ap[0][6],
            "airport_name": medium_ap[0][2],
            "latitude": medium_ap[0][4],
            "longitude": medium_ap[0][5],
            "type": "medium",
            "distance": medium_ap[1]
        }, {
            "iso_country": large_ap[0][0],
            "icao": large_ap[0][1],
            "country": large_ap[0][6],
            "airport_name": large_ap[0][2],
            "latitude": large_ap[0][4],
            "longitude": large_ap[0][5],
            "type": "large",
            "distance": large_ap[1]
        }]

    json_response = json.dumps(response)

    return Response(response=json_response, mimetype="application/json")

def get_db_connection():
    return db.yhteys

@app.route('/get_multiplier_and_weather_message/<latitude>/<longitude>')
def get_multiplier_and_weather_message(latitude, longitude):
    latitude_float = float(latitude)
    longitude_float = float(longitude)
    multiplication, weather_condition = weather.get_weather_multiplier_and_notify_weather(latitude_float, longitude_float)

    if multiplication and weather_condition:
        response = {
            "multiplier_number": multiplication,
            "alert_message": weather_condition
        }

    json_response = json.dumps(response)
    return Response(response=json_response, mimetype="application/json")



@app.route('/save-game', methods=['POST'])
def save_game():
    data = request.json
    screen_name = data['screen_name']
    aircraft_name = data['aircraft']
    final_location = data.get('final_location')  # Lentokentän nimi
    score = data.get('score')

    if screen_name and aircraft_name and score:
        # Tallenna tiedot tietokantaan
        db.save_player_score(screen_name, aircraft_name, final_location, score)
        return jsonify({'success': True, 'message': 'Data saved successfully'})
    else:
        return jsonify({'success': False, 'message': 'Missing required data'})


# Reitti HTML-sivujen näyttämiseksi

@app.route('/about') #about-sivun reitti
def index():
    return render_template("about.html")  # ei tarvita flaskista mitään niin pelkkä html-kutsu templates kansiosta


@app.route("/gamesite")
def gamesite():
    return render_template("gamesite.html")  # ei tarvita flaskista mitään, joten sama kuin about


@app.route('/score')
def view_scores():
    player_scores = db.get_player_scores()
    if player_scores:
        return render_template("score.html", tulokset=player_scores)  # välitetään tulokset-muuttuja templateen
    else:
        return 'Error: Unable to establish database connection'



if __name__ == '__main__':
    app.run(use_reloader=True, host = '127.0.0.1', port=3000)