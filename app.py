from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")

app = Flask(__name__)

def get_weather_by_city(city, units="metric"):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units={units}"
    response = requests.get(url)
    return response

def get_weather_by_coords(lat, lon, units="metric"):
    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units={units}"
    response = requests.get(url)
    return response

@app.route("/", methods=["GET", "POST"])
def index():
    weather = None
    error = None
    units = "metric"  # default units
    if request.method == "POST":
        units = request.form.get("units", "metric")
        city = request.form.get("city")
        lat = request.form.get("lat")
        lon = request.form.get("lon")
        
        # If coordinates are provided, get weather by coords (current location)
        if lat and lon:
            response = get_weather_by_coords(lat, lon, units)
        elif city:
            response = get_weather_by_city(city, units)
        else:
            error = "Please provide a city or allow location access."
            return render_template("index.html", weather=weather, error=error, units=units)
        
        data = response.json()
        if response.status_code == 200:
            weather = {
                "city": data["name"],
                "temperature": data["main"]["temp"],
                "description": data["weather"][0]["description"],
                "humidity": data["main"]["humidity"],
                "icon": data["weather"][0]["icon"],
                "units": units
            }
        else:
            error = data.get("message", "City not found or API error.")
    
    return render_template("index.html", weather=weather, error=error, units=units)

@app.route('/convert_units')
def convert_units():
    import requests
    city = request.args.get('city')
    units = request.args.get('units', 'metric')
    API_KEY = os.getenv("API_KEY")

    try:
        res = requests.get(f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units={units}")
        data = res.json()

        if res.status_code != 200:
            return jsonify({"success": False, "error": data.get("message", "Error")})

        temperature = round(data["main"]["temp"])
        return jsonify({"success": True, "temperature": temperature})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)})



if __name__ == "__main__":
    app.run(debug=True, port=5050)
