import requests
class Weather:
    def __init__(self, api_key="PUT OWN OPEN WEATHER MAP KEY"):
        self.api_key = "751e2dc779f4599493c66f9be78c7809"

    def get_weather(self, latitude, longitude):
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={self.api_key}"
        response = requests.get(url)
        data = response.json()
        if response.status_code == 200:
            weather_main = data.get("weather")[0].get("main")
            return weather_main
        else:
            print("Failed to fetch weather data")
            return None

    def get_weather_multiplier_and_notify_weather(self, latitude, longitude):
        weather_main = self.get_weather(latitude, longitude)
        if weather_main == "Clear":
            multiplier_number = 1
            weather_condition_message = "The weather is clear. No additional battery usage."
        elif weather_main == "Clouds":
            multiplier_number = 1.25
            weather_condition_message = "The weather is cloudy. Expect 10% more battery usage."
        elif weather_main == "Rain":
            multiplier_number = 1.50
            weather_condition_message = "It's raining. Expect 50% more battery usage."
        elif weather_main == "Snow":
            multiplier_number = 2
            weather_condition_message = "It's snowy. Expect 100% more battery usage."
        else:
            multiplier_number = 1
            weather_condition_message = "Weather condition is unknown. No change in battery usage."

        return multiplier_number, weather_condition_message


