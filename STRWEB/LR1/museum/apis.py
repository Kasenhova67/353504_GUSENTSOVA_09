import requests


def get_weather(city="Minsk"):
    api_key = "c4be0b5bcc54d27dcf5a0e86efd026aa"  
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        weather_data = {
            'city': data['name'],
            'temp': data['main']['temp'],
            'description': data['weather'][0]['description'],
            'icon': data['weather'][0]['icon'],
            'humidity': data['main']['humidity'],
            'wind': data['wind']['speed']
        }
        return weather_data
        
    except requests.exceptions.RequestException as e:
        print(f"Weather API error: {e}")
        return None
    except (KeyError, ValueError) as e:
        print(f"Error parsing weather data: {e}")
        return None

def get_cat_fact():
    url = 'https://catfact.ninja/fact'
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        return data['fact']
    except requests.exceptions.RequestException as e:
        print(f"Cat Facts API error: {e}")
        return None
    except (KeyError, ValueError) as e:
        print(f"Error parsing Cat Facts API response: {e}")
        return None