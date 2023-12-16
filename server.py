from flask import Flask, render_template, jsonify,request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import requests
import numpy as np
import joblib
import warnings
import random
import time

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/hello/<message>')
def display_message(message):
    print(message)
    return f'The message is: {message}'

@app.route('/sendDHT', methods=['POST'])
def post_data():
    try:
        data = request.get_json()
        # print(data)
        temperature = data.get('temperature')
        humidity = data.get('humidity')

        # You can process the data as needed, for example, store it in a database.
        response = {'message': 'Data received successfully'}
        return jsonify(response), 200

    except Exception as e:
        error_message = {'error': str(e)}
        return jsonify(error_message), 500  
    

@app.route('/old')
def getlive():
    return render_template('indexold.html')


@socketio.on('connect')
def handle_connect():
    print('Client connected')


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')




def generate_sensor_data():
    while True:
        # Simulate weather data
        # Simulate temperature between -30 and 5 degrees Celsius
        temperature = round(random.uniform(-40, 5), 2)
        weather_description = np.random.choice(
            ['Overcast clouds', 'Clear sky', 'Snowfall'])
        # Simulate precipitation between 0 and 5 mm
        precipitation = round(random.uniform(0, 5), 2)
        # Simulate humidity between 0% and 100%
        humidity = round(random.uniform(0, 100), 2)
        # Simulate wind speed between 0 and 20 km/h
        wind_speed = round(random.uniform(0, 20), 2)
        # Pressure
        pressure = round(random.uniform(0, 20), 2)
        # Simulate wind direction between 0 and 360 degrees
        wind_direction = round(random.uniform(0, 360), 2)

        weather_data = {
            'temperature': temperature,
            'weather_description': weather_description,
            'precipitation': precipitation,
            'humidity': humidity,
            'wind_speed': wind_speed,
            'wind_direction': wind_direction,
        }
        data = {
            "temperature": temperature,
            "humidity": humidity,
            "pressure": pressure,
            "wind speed": wind_speed,
            "wind direction": wind_direction,
        }
        
        try:
            response = requests.post('http://127.0.0.1:5000/predictavalanche', json=data)
        except Exception as e:
            print(f"Error sending POST request: {e}")

        # Send weather data to connected clients via WebSocket
        socketio.emit('weather_data', weather_data)

        time.sleep(2)  # Adjust the delay as needed


def generate_sensor_data2():
    while True:
        # Simulate sensor data
        sensor1_data = {
            # Simulate tilt between 0 and 30 degrees
            'tilt': round(random.uniform(0, 30), 2),
            # Simulate acceleration between 0 and 10 m/s²
            'acceleration': round(random.uniform(0, 10), 2),
        }

        sensor2_data = {
            # Simulate tilt between 0 and 30 degrees
            'tilt': round(random.uniform(0, 30), 2),
            # Simulate acceleration between 0 and 10 m/s²
            'acceleration': round(random.uniform(0, 10), 2),
        }

        # Send sensor data to connected clients via WebSocket
        socketio.emit('sensor1_data', sensor1_data)
        socketio.emit('sensor2_data', sensor2_data)

        time.sleep(3)  # Adjust the delay as needed


# Load the trained machine learning model just example model
model = joblib.load('avalanche.pkl')


@app.route('/predictavalanche', methods=['POST'])
def predict():
    warnings.filterwarnings("ignore")
    try:
        data = request.get_json()
        # features = ['temperature','humidity','pressure','wind speed','wind direction']
        features = [float(data['temperature']), float(data['humidity']), float(
            data['pressure']), float(data['wind speed']), float(data['wind direction'])]
        # print(features)

        input_features = np.array(features).reshape(1, -1)
        prediction = model.predict(input_features)

        # Ensure the prediction is a serializable data type (e.g., int or float)
        class_labels = {
            0: 'No Possibility Detected',
            1: 'Avalanche Possible'
        }
        prediction = int(prediction[0])  # Convert to float
        prediction = class_labels[prediction]

        # Send prediction to connected clients via WebSocket
        socketio.emit('prediction', prediction)

        return prediction
    except Exception as e:
        return jsonify(str(e))


if __name__ == '__main__':
    socketio.start_background_task(generate_sensor_data)
    socketio.start_background_task(generate_sensor_data2)
    socketio.run(app, host='0.0.0.0',port=5000,debug=True)
