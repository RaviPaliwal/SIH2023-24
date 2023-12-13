from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import numpy as np
import joblib
import warnings
import random
import time

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app)

# Load the trained machine learning model
model = joblib.load('iris_model.pkl')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/getlive')
def getlive():
    return render_template('sensordatalive.html')    

@app.route('/predict', methods=['POST'])
def predict():
    warnings.filterwarnings("ignore")
    try:
        data = request.get_json()
        features = [float(data['sepal_length']), float(data['sepal_width']), float(data['petal_length']), float(data['petal_width'])]
        print(features)
        
        input_features = np.array(features).reshape(1, -1)
        prediction = model.predict(input_features)

        # Ensure the prediction is a serializable data type (e.g., int or float)
        class_labels = {
            0: 'Setosa',
            1: 'Versicolor',
            2: 'Virginica'
        }   
        prediction = int(prediction[0])  # Convert to float
        prediction = class_labels[prediction]

        # Send prediction to connected clients via WebSocket
        socketio.emit('prediction', prediction)

        return prediction
    except Exception as e:
        return jsonify(str(e))

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

def generate_sensor_data():
    while True:
        # Simulate sensor data (replace this with your actual sensor data logic)
        sensor_data = random.uniform(0, 1)
        
        # Send sensor data to connected clients via WebSocket
        socketio.emit('sensor_data', sensor_data)
        
        time.sleep(1)  # Adjust the delay as needed

if __name__ == '__main__':
    socketio.start_background_task(generate_sensor_data)
    socketio.run(app, debug=True)
